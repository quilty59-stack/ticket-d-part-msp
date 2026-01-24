import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStagiaires, useGrades } from '@/hooks/useReferenceData';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GraduationCap, Plus, Trash2, Loader2, Calendar } from 'lucide-react';

export default function Stagiaires() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stagiaires = [], isLoading } = useStagiaires();
  const { data: grades = [] } = useGrades();

  const [gradeId, setGradeId] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Add stagiaire mutation
  const addStagiaire = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('stagiaires').insert({
        grade_id: gradeId || null,
        nom: nom.toUpperCase(),
        prenom,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      toast({
        title: 'Stagiaire ajouté',
        description: `${nom} ${prenom} a été ajouté à la liste`,
      });
      setGradeId('');
      setNom('');
      setPrenom('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete stagiaire mutation
  const deleteStagiaire = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stagiaires').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      toast({
        title: 'Stagiaire retiré',
        description: 'Le stagiaire a été retiré de la liste',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Le nom et le prénom sont obligatoires',
        variant: 'destructive',
      });
      return;
    }
    addStagiaire.mutate();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              Stagiaires du jour
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
        </div>

        {/* Liste des stagiaires */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Stagiaires présents ({stagiaires.length})
            </CardTitle>
            <CardDescription>
              Les stagiaires ajoutés ici seront disponibles pour l'affectation aux véhicules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : stagiaires.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun stagiaire ajouté pour aujourd'hui
              </p>
            ) : (
              <div className="space-y-2">
                {stagiaires.map((stagiaire) => (
                  <div
                    key={stagiaire.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-amber-500" />
                      <span className="font-medium text-sm text-muted-foreground">
                        {stagiaire.grades?.code || 'N/A'}
                      </span>
                      <span className="font-medium">
                        {stagiaire.nom} {stagiaire.prenom}
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Retirer ce stagiaire ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {stagiaire.nom} {stagiaire.prenom} sera retiré de la liste des stagiaires du jour.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteStagiaire.mutate(stagiaire.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Retirer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulaire d'ajout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ajouter un stagiaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={gradeId} onValueChange={setGradeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.code} - {grade.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    placeholder="DUPONT"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="Jean"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={addStagiaire.isPending}
                className="w-full sm:w-auto"
              >
                {addStagiaire.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Ajouter le stagiaire
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              💡 Les stagiaires ajoutés ici seront automatiquement disponibles
              dans le formulaire de création de tickets pour les affecter aux véhicules.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
