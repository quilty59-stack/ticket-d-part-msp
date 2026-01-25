import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStagiaires, useManoeuvrants, useGrades } from '@/hooks/useReferenceData';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { GraduationCap, UserCog, Plus, Trash2, Loader2 } from 'lucide-react';

const POSTES = [
  { value: 'CA', label: 'Chef d\'Agrès (CA)' },
  { value: 'COND', label: 'Conducteur (COND)' },
  { value: 'CE', label: 'Chef d\'Équipe (CE)' },
  { value: 'EQ', label: 'Équipier (EQ)' },
];

export default function Stagiaires() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stagiaires = [], isLoading: loadingStagiaires } = useStagiaires();
  const { data: manoeuvrants = [], isLoading: loadingManoeuvrants } = useManoeuvrants();
  const { data: grades = [] } = useGrades();

  // Stagiaire form state
  const [stagGradeId, setStagGradeId] = useState('');
  const [stagNom, setStagNom] = useState('');
  const [stagPrenom, setStagPrenom] = useState('');

  // Manoeuvrant form state
  const [manoGradeId, setManoGradeId] = useState('');
  const [manoNom, setManoNom] = useState('');
  const [manoPrenom, setManoPrenom] = useState('');
  const [manoPoste, setManoPoste] = useState('');

  // Add stagiaire mutation
  const addStagiaire = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('stagiaires').insert({
        grade_id: stagGradeId || null,
        nom: stagNom.toUpperCase(),
        prenom: stagPrenom,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      toast({
        title: 'Stagiaire ajouté',
        description: `${stagNom} ${stagPrenom} a été ajouté`,
      });
      setStagGradeId('');
      setStagNom('');
      setStagPrenom('');
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
        title: 'Stagiaire supprimé',
        description: 'Le stagiaire a été supprimé',
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

  // Add manoeuvrant mutation
  const addManoeuvrant = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('manoeuvrants').insert({
        grade_id: manoGradeId || null,
        nom: manoNom.toUpperCase(),
        prenom: manoPrenom,
        poste: manoPoste,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manoeuvrants'] });
      toast({
        title: 'Manœuvrant ajouté',
        description: `${manoNom} ${manoPrenom} a été ajouté`,
      });
      setManoGradeId('');
      setManoNom('');
      setManoPrenom('');
      setManoPoste('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete manoeuvrant mutation
  const deleteManoeuvrant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('manoeuvrants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manoeuvrants'] });
      toast({
        title: 'Manœuvrant supprimé',
        description: 'Le manœuvrant a été supprimé',
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

  const handleSubmitStagiaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagNom.trim() || !stagPrenom.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Le nom et le prénom sont obligatoires',
        variant: 'destructive',
      });
      return;
    }
    addStagiaire.mutate();
  };

  const handleSubmitManoeuvrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manoNom.trim() || !manoPrenom.trim() || !manoPoste) {
      toast({
        title: 'Champs requis',
        description: 'Le nom, prénom et poste sont obligatoires',
        variant: 'destructive',
      });
      return;
    }
    addManoeuvrant.mutate();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personnel temporaire</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les stagiaires et manœuvrants disponibles pour les interventions
          </p>
        </div>

        <Tabs defaultValue="stagiaires" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stagiaires" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Stagiaires ({stagiaires.length})
            </TabsTrigger>
            <TabsTrigger value="manoeuvrants" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Manœuvrants ({manoeuvrants.length})
            </TabsTrigger>
          </TabsList>

          {/* STAGIAIRES TAB */}
          <TabsContent value="stagiaires" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liste des stagiaires</CardTitle>
                <CardDescription>
                  Les stagiaires sont disponibles pour l'affectation aux véhicules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStagiaires ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : stagiaires.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun stagiaire enregistré
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stagiaires.map((stagiaire) => (
                      <div
                        key={stagiaire.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 text-primary" />
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
                              <AlertDialogTitle>Supprimer ce stagiaire ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {stagiaire.nom} {stagiaire.prenom} sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteStagiaire.mutate(stagiaire.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ajouter un stagiaire</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitStagiaire} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stag-grade">Grade</Label>
                      <Select value={stagGradeId} onValueChange={setStagGradeId}>
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
                      <Label htmlFor="stag-nom">Nom</Label>
                      <Input
                        id="stag-nom"
                        placeholder="DUPONT"
                        value={stagNom}
                        onChange={(e) => setStagNom(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stag-prenom">Prénom</Label>
                      <Input
                        id="stag-prenom"
                        placeholder="Jean"
                        value={stagPrenom}
                        onChange={(e) => setStagPrenom(e.target.value)}
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
          </TabsContent>

          {/* MANOEUVRANTS TAB */}
          <TabsContent value="manoeuvrants" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liste des manœuvrants</CardTitle>
                <CardDescription>
                  Les manœuvrants avec leur poste assigné (CA, COND, CE, EQ)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingManoeuvrants ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : manoeuvrants.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun manœuvrant enregistré
                  </p>
                ) : (
                  <div className="space-y-2">
                    {manoeuvrants.map((mano) => (
                      <div
                        key={mano.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <UserCog className="w-5 h-5 text-accent-foreground" />
                          <span className="font-medium text-sm text-muted-foreground">
                            {mano.grades?.code || 'N/A'}
                          </span>
                          <span className="font-medium">
                            {mano.nom} {mano.prenom}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-primary/10 text-primary">
                            {mano.poste}
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
                              <AlertDialogTitle>Supprimer ce manœuvrant ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {mano.nom} {mano.prenom} sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteManoeuvrant.mutate(mano.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ajouter un manœuvrant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitManoeuvrant} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mano-grade">Grade</Label>
                      <Select value={manoGradeId} onValueChange={setManoGradeId}>
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
                      <Label htmlFor="mano-poste">Poste</Label>
                      <Select value={manoPoste} onValueChange={setManoPoste}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un poste" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSTES.map((poste) => (
                            <SelectItem key={poste.value} value={poste.value}>
                              {poste.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mano-nom">Nom</Label>
                      <Input
                        id="mano-nom"
                        placeholder="DUPONT"
                        value={manoNom}
                        onChange={(e) => setManoNom(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mano-prenom">Prénom</Label>
                      <Input
                        id="mano-prenom"
                        placeholder="Jean"
                        value={manoPrenom}
                        onChange={(e) => setManoPrenom(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={addManoeuvrant.isPending}
                    className="w-full sm:w-auto"
                  >
                    {addManoeuvrant.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Ajouter le manœuvrant
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              💡 Les stagiaires et manœuvrants ajoutés ici sont permanents et disponibles
              pour l'affectation aux véhicules dans les tickets d'intervention.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}