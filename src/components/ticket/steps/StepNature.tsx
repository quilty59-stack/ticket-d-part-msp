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
import { CategoryBadge } from '@/components/ticket/CategoryBadge';
import { Flame, Phone, Info, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Categorie, Nature } from '@/lib/supabase-types';

interface StepNatureProps {
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
  // Champs additionnels
  coordonnees: string;
  setCoordonnees: (value: string) => void;
  ptsEauIndispo: string;
  setPtsEauIndispo: (value: string) => void;
  transit: string;
  setTransit: (value: string) => void;
  talkgroup: string;
  setTalkgroup: (value: string) => void;
  renfort: string;
  setRenfort: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
}

export function StepNature({
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
  coordonnees,
  setCoordonnees,
  ptsEauIndispo,
  setPtsEauIndispo,
  transit,
  setTransit,
  talkgroup,
  setTalkgroup,
  renfort,
  setRenfort,
  message,
  setMessage,
}: StepNatureProps) {
  return (
    <div className="space-y-6">
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
          <div className="space-y-2">
            <Label>Coordonnées (X, Y)</Label>
            <Input
              placeholder="X: 811440   Y: 2181104"
              value={coordonnees}
              onChange={(e) => setCoordonnees(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Points d'eau indisponibles</Label>
            <Input
              placeholder="PI rue de la gare..."
              value={ptsEauIndispo}
              onChange={(e) => setPtsEauIndispo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Moyens & Communication */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Communication & Renforts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transit</Label>
              <Input
                placeholder="Canal transit..."
                value={transit}
                onChange={(e) => setTransit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Talkgroup</Label>
              <Input
                placeholder="71-SAP..."
                value={talkgroup}
                onChange={(e) => setTalkgroup(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Renfort(s)</Label>
            <Input
              placeholder="VSAV LU2, SMUR..."
              value={renfort}
              onChange={(e) => setRenfort(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Message à transmettre..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
