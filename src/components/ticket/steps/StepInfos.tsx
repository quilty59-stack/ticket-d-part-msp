import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import type { Origine } from '@/lib/supabase-types';

interface StepInfosProps {
  dateIntervention: string;
  setDateIntervention: (value: string) => void;
  origineId: string;
  setOrigineId: (value: string) => void;
  origines: Origine[];
}

export function StepInfos({
  dateIntervention,
  setDateIntervention,
  origineId,
  setOrigineId,
  origines,
}: StepInfosProps) {
  return (
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
  );
}
