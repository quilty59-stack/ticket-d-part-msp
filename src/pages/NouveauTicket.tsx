import { useState, useMemo, useEffect } from 'react';
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
  useManoeuvrants,
} from '@/hooks/useReferenceData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { StepInfos, StepNature, StepMoyens } from '@/components/ticket/steps';
import {
  Flame,
  Save,
  FileText,
  Loader2,
  User,
  GraduationCap,
  Wrench,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import type { Vehicule, PersonnelDisponible, MoyenAffecte, Ticket } from '@/lib/supabase-types';

const STEPS_NORMAL = [
  { id: 'infos', label: 'Infos & Localisation', icon: FileText },
  { id: 'nature', label: 'Nature', icon: Flame },
  { id: 'moyens', label: 'Moyens & Équipages', icon: User },
] as const;

const STEPS_RENFORT = [
  { id: 'infos', label: 'Intervention à renforcer', icon: AlertCircle },
  { id: 'moyens', label: 'Moyens & Équipages', icon: User },
] as const;

type StepId = 'infos' | 'nature' | 'moyens';

export default function NouveauTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Step state
  const [currentStep, setCurrentStep] = useState<StepId>('infos');

  // Form state
  const [dateIntervention, setDateIntervention] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [origineId, setOrigineId] = useState('');
  const [communeId, setCommuneId] = useState('');
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
  const [coordonnees, setCoordonnees] = useState('');
  const [ptsEauIndispo, setPtsEauIndispo] = useState('');
  const [transit, setTransit] = useState('');
  const [talkgroup, setTalkgroup] = useState('');
  const [renfort, setRenfort] = useState('');
  const [message, setMessage] = useState('');

  // Mode renfort
  const [selectedRenfortTicket, setSelectedRenfortTicket] = useState<Ticket | null>(null);

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
  const { data: manoeuvrants = [] } = useManoeuvrants();

  // Check if mode renfort
  const isRenfortMode = useMemo(() => {
    const selectedOrigine = origines.find((o) => o.id === origineId);
    return selectedOrigine?.libelle?.toLowerCase().includes('renfort') || false;
  }, [origineId, origines]);

  // Determine steps based on mode
  const STEPS = isRenfortMode ? STEPS_RENFORT : STEPS_NORMAL;

  // Reset renfort ticket when switching out of renfort mode
  useEffect(() => {
    if (!isRenfortMode) {
      setSelectedRenfortTicket(null);
    }
  }, [isRenfortMode]);

  // Combine personnel, stagiaires and manoeuvrants
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

    const manoeuv: PersonnelDisponible[] = manoeuvrants.map((m) => ({
      id: m.id,
      type: 'manoeuvrant',
      grade_code: m.grades?.code || '',
      grade_libelle: m.grades?.libelle || '',
      nom: m.nom,
      prenom: m.prenom,
      poste: m.poste,
    }));

    return [...manoeuv, ...permanents, ...stags];
  }, [personnel, stagiaires, manoeuvrants]);

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

  // Navigation between steps
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoPrev = currentStepIndex > 0;

  const goNext = () => {
    if (canGoNext) {
      setCurrentStep(STEPS[currentStepIndex + 1].id as StepId);
    }
  };

  const goPrev = () => {
    if (canGoPrev) {
      setCurrentStep(STEPS[currentStepIndex - 1].id as StepId);
    }
  };

  // Build moyens array
  const buildMoyens = (): MoyenAffecte[] => {
    return selectedVehicules.map((v) => {
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
  };

  // Create ticket mutation (new ticket)
  const createTicket = useMutation({
    mutationFn: async (etat: 'brouillon' | 'valide') => {
      const moyens = buildMoyens();

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
        coordonnees: coordonnees || null,
        pts_eau_indispo: ptsEauIndispo || null,
        transit: transit || null,
        talkgroup: talkgroup || null,
        renfort: renfort || null,
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
      navigate('/historique');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add renfort to existing ticket mutation
  const addRenfortToTicket = useMutation({
    mutationFn: async () => {
      if (!selectedRenfortTicket) throw new Error('Aucune intervention sélectionnée');

      const newMoyens = buildMoyens();
      const existingMoyens = (selectedRenfortTicket.moyens || []) as MoyenAffecte[];
      const combinedMoyens = [...existingMoyens, ...newMoyens];

      const { data, error } = await supabase
        .from('tickets')
        .update({
          moyens: combinedMoyens as unknown as never,
          renfort: selectedRenfortTicket.renfort
            ? `${selectedRenfortTicket.renfort}, ${newMoyens.map((m) => m.vehicule_code).join(', ')}`
            : newMoyens.map((m) => m.vehicule_code).join(', '),
        })
        .eq('id', selectedRenfortTicket.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets-en-cours'] });
      toast({
        title: 'Renfort ajouté',
        description: `Renfort ajouté au ticket ${data.num_inter}`,
      });
      navigate('/historique');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isLastStep = currentStep === 'moyens';
  const isPending = createTicket.isPending || addRenfortToTicket.isPending;

  return (
    <AppLayout>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {isRenfortMode ? (
                <>
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  Demande de Renfort
                </>
              ) : (
                <>
                  <Flame className="w-6 h-6 text-primary" />
                  Nouveau Ticket de Départ
                </>
              )}
            </h1>
          </div>

          <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as StepId)}>
            <TabsList className={`grid w-full ${isRenfortMode ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {STEPS.map((step, index) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="infos" className="mt-6">
              <StepInfos
                dateIntervention={dateIntervention}
                setDateIntervention={setDateIntervention}
                origineId={origineId}
                setOrigineId={setOrigineId}
                origines={origines}
                isRenfortMode={isRenfortMode}
                selectedRenfortTicket={selectedRenfortTicket}
                onSelectRenfortTicket={setSelectedRenfortTicket}
                communeId={communeId}
                setCommuneId={setCommuneId}
                communes={communes}
                typeLieuId={typeLieuId}
                setTypeLieuId={setTypeLieuId}
                typesLieux={typesLieux}
                numVoie={numVoie}
                setNumVoie={setNumVoie}
                typeVoieId={typeVoieId}
                setTypeVoieId={setTypeVoieId}
                typesVoies={typesVoies}
                nomVoie={nomVoie}
                setNomVoie={setNomVoie}
                complementAdresse={complementAdresse}
                setComplementAdresse={setComplementAdresse}
              />
            </TabsContent>

            {!isRenfortMode && (
              <TabsContent value="nature" className="mt-6">
                <StepNature
                  categorieId={categorieId}
                  setCategorieId={setCategorieId}
                  categories={categories}
                  natureId={natureId}
                  setNatureId={setNatureId}
                  natures={natures}
                  complementNature={complementNature}
                  setComplementNature={setComplementNature}
                  appelant={appelant}
                  setAppelant={setAppelant}
                  victime={victime}
                  setVictime={setVictime}
                  rensCompl={rensCompl}
                  setRensCompl={setRensCompl}
                  coordonnees={coordonnees}
                  setCoordonnees={setCoordonnees}
                  ptsEauIndispo={ptsEauIndispo}
                  setPtsEauIndispo={setPtsEauIndispo}
                  transit={transit}
                  setTransit={setTransit}
                  talkgroup={talkgroup}
                  setTalkgroup={setTalkgroup}
                  renfort={renfort}
                  setRenfort={setRenfort}
                  message={message}
                  setMessage={setMessage}
                />
              </TabsContent>
            )}

            <TabsContent value="moyens" className="mt-6">
              <StepMoyens
                selectedVehicules={selectedVehicules}
                affectations={affectations}
                vehiculeSelectOpen={vehiculeSelectOpen}
                setVehiculeSelectOpen={setVehiculeSelectOpen}
                availableVehicules={availableVehicules}
                personnelDisponible={personnelDisponible}
                affectedIds={affectedIds}
                onAddVehicule={handleAddVehicule}
                onRemoveVehicule={handleRemoveVehicule}
                onRemoveAffectation={handleRemoveAffectation}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation & Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <div className="flex gap-2">
              {isLastStep && (
                <>
                  {isRenfortMode ? (
                    <Button
                      onClick={() => addRenfortToTicket.mutate()}
                      disabled={isPending || !selectedRenfortTicket || selectedVehicules.length === 0}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      Ajouter le renfort
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => createTicket.mutate('brouillon')}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Enregistrer brouillon
                      </Button>
                      <Button
                        onClick={() => createTicket.mutate('valide')}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        Valider et générer PDF
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            <Button onClick={goNext} disabled={!canGoNext}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragItem && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground shadow-lg">
              {activeDragItem.type === 'manoeuvrant' ? (
                <Wrench className="w-4 h-4 text-emerald-500" />
              ) : activeDragItem.type === 'stagiaire' ? (
                <GraduationCap className="w-4 h-4 text-amber-500" />
              ) : (
                <User className="w-4 h-4 text-primary" />
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
