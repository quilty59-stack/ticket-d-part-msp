import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import { MapPin, Flame, Phone, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Commune,
  TypeLieu,
  TypeVoie,
  Categorie,
  Nature,
} from '@/lib/supabase-types';

interface StepLocalisationProps {
  // Localisation
  communeId: string;
  setCommuneId: (value: string) => void;
  communes: Commune[];
  typeLieuId: string;
  setTypeLieuId: (value: string) => void;
  typesLieux: TypeLieu[];
  numVoie: string;
  setNumVoie: (value: string) => void;
  typeVoieId: string;
  setTypeVoieId: (value: string) => void;
  typesVoies: TypeVoie[];
  nomVoie: string;
  setNomVoie: (value: string) => void;
  complementAdresse: string;
  setComplementAdresse: (value: string) => void;
  // Nature
  categorieId: string;
  setCategorieId: (value: string) => void;
  categories: Categorie[];
  natureId: string;
  setNatureId: (value: string) => void;
  natures: Nature[];
  complementNature: string;
  setComplementNature: (value: string) => void;
  // Infos complémentaires
  appelant: string;
  setAppelant: (value: string) => void;
  victime: string;
  setVictime: (value: string) => void;
  rensCompl: string;
  setRensCompl: (value: string) => void;
}

export function StepLocalisation({
  communeId,
  setCommuneId,
  communes,
  typeLieuId,
  setTypeLieuId,
  typesLieux,
  numVoie,
  setNumVoie,
  typeVoieId,
  setTypeVoieId,
  typesVoies,
  nomVoie,
  setNomVoie,
  complementAdresse,
  setComplementAdresse,
  categorieId,
  setCategorieId,
  categories,
  natureId,
  setNatureId,
  natures,
  complementNature,
  setComplementNature,
  appelant,
  setAppelant,
  victime,
  setVictime,
  rensCompl,
  setRensCompl,
}: StepLocalisationProps) {
  const [communeOpen, setCommuneOpen] = useState(false);
  const selectedCommune = communes.find((c) => c.id === communeId);

  return (
    <div className="space-y-6">
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
                    categorieId === cat.id &&
                      'ring-2 ring-offset-2 ring-primary rounded-full'
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
    </div>
  );
}
