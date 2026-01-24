import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  useCommunes,
  useCategories,
  useNatures,
  useTypesLieux,
  useTypesVoies,
  useOrigines,
  useVehicules,
  usePersonnel,
  useStagiaires,
  useGrades,
} from '@/hooks/useReferenceData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PersonnelCard } from '@/components/ticket/PersonnelCard';
import { VehiculeCard } from '@/components/ticket/VehiculeCard';
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  MapPin,
  Flame,
  Phone,
  Truck,
  Users,
  Plus,
  Save,
  FileText,
  Loader2,
  Check,
  ChevronsUpDown,
  User,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicule, PersonnelDisponible, MoyenAffecte } from '@/lib/supabase-types';

export default function NouveauTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [dateIntervention, setDateIntervention] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [origineId, setOrigineId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [communeOpen, setCommuneOpen] = useState(false);
  const [typeLieuId, setTypeLieuId] = useState('');
  const [numVoie, setNumVoie] = useState('');
  const [typeVoieId, setTypeVoieId] = useState('');
  const [nomVoie, setNomVoie] = useState('');
  const [complementAdresse, setComplementAdresse] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [natureId, setNatureId] = useState('');
  const [complementNature, setComplementNature] = useState('');
  const [appelant, setAppelant] = useState('');
  const [victime, setVictime] = useState('');
  const [rensCompl, setRensCompl] = useState('');

  // Moyens state
  const [selectedVehicules, setSelectedVehicules] = useState<Vehicule[]>([]);
  const [affectations, setAffectations] = useState<
    Record<string, Record<string, PersonnelDisponible | null>>
  >({});
  const [vehiculeSelectOpen, setVehiculeSelectOpen] = useState(false);

  // Drag state
  const [activeDragItem, setActiveDragItem] = useState<PersonnelDisponible | null>(null);

  // Fetch data
  const { data: communes = [] } = useCommunes();
  const { data: categories = [] } = useCategories();
  const { data: natures = [] } = useNatures(categorieId || undefined);
  const { data: typesLieux = [] } = useTypesLieux();
  const { data: typesVoies = [] } = useTypesVoies();
  const { data: origines = [] } = useOrigines();
  const { data: vehicules = [] } = useVehicules();
  const { data: personnel = [] } = usePersonnel();
  const { data: stagiaires = [] } = useStagiaires();
  const { data: grades = [] } = useGrades();

  // Combine personnel and stagiaires
  const personnelDisponible = useMemo<PersonnelDisponible[]>(() => {
    const permanents: PersonnelDisponible[] = personnel.map((p) => ({
      id: p.id,
      type: 'permanent',
      grade_code: p.grades?.code || '',
      grade_libelle: p.grades?.libelle || '',
      nom: p.nom,
      prenom: p.prenom,
    }));

    const stags: PersonnelDisponible[] = stagiaires.map((s) => ({
      id: s.id,
      type: 'stagiaire',
      grade_code: s.grades?.code || '',
      grade_libelle: s.grades?.libelle || '',
      nom: s.nom,
      prenom: s.prenom,
    }));

    return [...permanents, ...stags];
  }, [personnel, stagiaires]);

  // Get all affected person IDs
  const affectedIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(affectations).forEach((vehiculeAffectations) => {
      Object.values(vehiculeAffectations).forEach((person) => {
        if (person) ids.add(person.id);
      });
    });
    return ids;
  }, [affectations]);

  // Available vehicules (not selected)
  const availableVehicules = useMemo(() => {
    const selectedIds = new Set(selectedVehicules.map((v) => v.id));
    return vehicules.filter((v) => !selectedIds.has(v.id));
  }, [vehicules, selectedVehicules]);

  // Selected commune name
  const selectedCommune = communes.find((c) => c.id === communeId);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as PersonnelDisponible;
    setActiveDragItem(data);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    
    const { active, over } = event;
    if (!over) return;

    const person = active.data.current as PersonnelDisponible;
    const dropData = over.data.current as { vehiculeId: string; poste: string; index: number };

    if (!dropData || !dropData.vehiculeId) return;

    const posteKey = `${dropData.poste}-${dropData.index}`;
    
    setAffectations((prev) => ({
      ...prev,
      [dropData.vehiculeId]: {
        ...prev[dropData.vehiculeId],
        [posteKey]: person,
      },
    }));
  };

  // Add vehicule
  const handleAddVehicule = (vehicule: Vehicule) => {
    setSelectedVehicules((prev) => [...prev, vehicule]);
    setAffectations((prev) => ({
      ...prev,
      [vehicule.id]: {},
    }));
    setVehiculeSelectOpen(false);
  };

  // Remove vehicule
  const handleRemoveVehicule = (vehiculeId: string) => {
    setSelectedVehicules((prev) => prev.filter((v) => v.id !== vehiculeId));
    setAffectations((prev) => {
      const newAffectations = { ...prev };
      delete newAffectations[vehiculeId];
      return newAffectations;
    });
  };

  // Remove affectation
  const handleRemoveAffectation = (vehiculeId: string, posteKey: string) => {
    setAffectations((prev) => ({
      ...prev,
      [vehiculeId]: {
        ...prev[vehiculeId],
        [posteKey]: null,
      },
    }));
  };

  // Create ticket mutation
  const createTicket = useMutation({
    mutationFn: async (etat: 'brouillon' | 'valide') => {
      // Build moyens array
      const moyens: MoyenAffecte[] = selectedVehicules.map((v) => {
        const vehiculeAffectations = affectations[v.id] || {};
        const postes: Record<string, string | string[]> = {};

        Object.entries(vehiculeAffectations).forEach(([posteKey, person]) => {
          if (person) {
            const [poste] = posteKey.split('-');
            const personRef = `${person.type}:${person.id}`;
            
            if (v.postes[poste] > 1) {
              if (!postes[poste]) postes[poste] = [];
              (postes[poste] as string[]).push(personRef);
            } else {
              postes[poste] = personRef;
            }
          }
        });

        return {
          vehicule_id: v.id,
          vehicule_code: v.code,
          postes,
        };
      });

      const insertData: Record<string, unknown> = {
        date_intervention: dateIntervention,
        origine_id: origineId || null,
        commune_id: communeId || null,
        type_lieu_id: typeLieuId || null,
        num_voie: numVoie || null,
        type_voie_id: typeVoieId || null,
        nom_voie: nomVoie || null,
        complement_adresse: complementAdresse || null,
        categorie_id: categorieId || null,
        nature_id: natureId || null,
        complement_nature: complementNature || null,
        appelant: appelant || null,
        victime: victime || null,
        rens_compl: rensCompl || null,
        moyens: moyens,
        etat,
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Ticket créé',
        description: `Ticket ${data.num_inter} créé avec succès`,
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <AppLayout>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              Nouveau Ticket de Départ
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations intervention */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Informations intervention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date et heure</Label>
                      <Input
                        type="datetime-local"
                        value={dateIntervention}
                        onChange={(e) => setDateIntervention(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Origine</Label>
                      <Select value={origineId} onValueChange={setOrigineId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'origine" />
                        </SelectTrigger>
                        <SelectContent>
                          {origines.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.libelle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Commune</Label>
                      <Popover open={communeOpen} onOpenChange={setCommuneOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedCommune?.nom || 'Sélectionner une commune'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une commune..." />
                            <CommandList>
                              <CommandEmpty>Aucune commune trouvée</CommandEmpty>
                              <CommandGroup>
                                {communes.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={c.nom}
                                    onSelect={() => {
                                      setCommuneId(c.id);
                                      setCommuneOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        communeId === c.id ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    {c.nom}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Type de lieu</Label>
                      <Select value={typeLieuId} onValueChange={setTypeLieuId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {typesLieux.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.libelle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-2 space-y-2">
                      <Label>N°</Label>
                      <Input
                        placeholder="123"
                        value={numVoie}
                        onChange={(e) => setNumVoie(e.target.value)}
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label>Type voie</Label>
                      <Select value={typeVoieId} onValueChange={setTypeVoieId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typesVoies.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.libelle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-7 space-y-2">
                      <Label>Nom de voie</Label>
                      <Input
                        placeholder="DE LA GRISIERE"
                        value={nomVoie}
                        onChange={(e) => setNomVoie(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Complément d'adresse</Label>
                    <Input
                      placeholder="Angle route de Sancé, bâtiment B..."
                      value={complementAdresse}
                      onChange={(e) => setComplementAdresse(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Nature */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Nature de l'intervention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategorieId(cat.id);
                            setNatureId('');
                          }}
                          className={cn(
                            'transition-all',
                            categorieId === cat.id && 'ring-2 ring-offset-2 ring-primary rounded-full'
                          )}
                        >
                          <CategoryBadge code={cat.code} libelle={cat.libelle} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nature</Label>
                    <Select
                      value={natureId}
                      onValueChange={setNatureId}
                      disabled={!categorieId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la nature" />
                      </SelectTrigger>
                      <SelectContent>
                        {natures.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.libelle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Détails complémentaires</Label>
                    <Input
                      placeholder="Moto seule, personne âgée..."
                      value={complementNature}
                      onChange={(e) => setComplementNature(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations complémentaires */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Informations complémentaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Appelant (téléphone)</Label>
                      <Input
                        placeholder="0612345678"
                        value={appelant}
                        onChange={(e) => setAppelant(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Victime</Label>
                      <Input
                        placeholder="Homme casqué au sol..."
                        value={victime}
                        onChange={(e) => setVictime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Renseignements complémentaires</Label>
                    <Textarea
                      placeholder="À côté des containers, accès par la rue..."
                      value={rensCompl}
                      onChange={(e) => setRensCompl(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Moyens et équipages */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Moyens et équipages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedVehicules.map((vehicule) => (
                    <VehiculeCard
                      key={vehicule.id}
                      vehicule={vehicule}
                      affectations={affectations[vehicule.id] || {}}
                      onRemoveVehicule={() => handleRemoveVehicule(vehicule.id)}
                      onRemoveAffectation={(posteKey) =>
                        handleRemoveAffectation(vehicule.id, posteKey)
                      }
                    />
                  ))}

                  <Popover open={vehiculeSelectOpen} onOpenChange={setVehiculeSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un moyen
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher un véhicule..." />
                        <CommandList>
                          <CommandEmpty>Aucun véhicule disponible</CommandEmpty>
                          <CommandGroup>
                            {availableVehicules.map((v) => (
                              <CommandItem
                                key={v.id}
                                value={v.code}
                                onSelect={() => handleAddVehicule(v)}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                {v.code}
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {v.taille_equipage} pers.
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => createTicket.mutate('brouillon')}
                  disabled={createTicket.isPending}
                >
                  {createTicket.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Enregistrer brouillon
                </Button>
                <Button
                  onClick={() => createTicket.mutate('valide')}
                  disabled={createTicket.isPending}
                >
                  {createTicket.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Valider et générer PDF
                </Button>
              </div>
            </div>

            {/* Right column - Personnel disponible */}
            <div className="space-y-4">
              <Card className="sticky top-20">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personnel disponible
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Permanents */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Permanents ({personnel.length})
                    </h4>
                    <div className="space-y-2">
                      {personnelDisponible
                        .filter((p) => p.type === 'permanent')
                        .map((person) => (
                          <PersonnelCard
                            key={person.id}
                            person={person}
                            isAffected={affectedIds.has(person.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Stagiaires */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      Stagiaires du jour ({stagiaires.length})
                    </h4>
                    {stagiaires.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Aucun stagiaire ajouté aujourd'hui
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {personnelDisponible
                          .filter((p) => p.type === 'stagiaire')
                          .map((person) => (
                            <PersonnelCard
                              key={person.id}
                              person={person}
                              isAffected={affectedIds.has(person.id)}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragItem && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground shadow-lg">
              {activeDragItem.type === 'permanent' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <GraduationCap className="w-4 h-4 text-amber-500" />
              )}
              <span className="font-medium text-xs text-muted-foreground">
                {activeDragItem.grade_code}
              </span>
              <span className="text-sm">
                {activeDragItem.nom} {activeDragItem.prenom}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </AppLayout>
  );
}
