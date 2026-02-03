import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGrades } from '@/hooks/useReferenceData';
import {
  useSessionsFormation,
  useStagiairesBySession,
  useManoeuvrantsBySession,
  useCreateSession,
  useDeleteSession,
  useAddStagiaireToSession,
  useAddManoeuvrantToSession,
  useDeleteStagiaire,
  useDeleteManoeuvrant,
  SessionFormation,
} from '@/hooks/useSessionsFormation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  GraduationCap,
  UserCog,
  Plus,
  Trash2,
  Loader2,
  FolderOpen,
  Calendar,
  Users,
  BookOpen,
} from 'lucide-react';

const POSTES = [
  { value: 'CA', label: 'Chef d\'Agrès (CA)' },
  { value: 'COND', label: 'Conducteur (COND)' },
  { value: 'CE', label: 'Chef d\'Équipe (CE)' },
  { value: 'EQ', label: 'Équipier (EQ)' },
];

export default function SessionsFormation() {
  const { toast } = useToast();
  const { data: sessions = [], isLoading: loadingSessions } = useSessionsFormation();
  const { data: grades = [] } = useGrades();

  // Selected session
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Load stagiaires and manoeuvrants for selected session
  const { data: stagiaires = [], isLoading: loadingStagiaires } = useStagiairesBySession(selectedSessionId);
  const { data: manoeuvrants = [], isLoading: loadingManoeuvrants } = useManoeuvrantsBySession(selectedSessionId);

  // Mutations
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();
  const addStagiaire = useAddStagiaireToSession();
  const addManoeuvrant = useAddManoeuvrantToSession();
  const deleteStagiaireMutation = useDeleteStagiaire();
  const deleteManoeuvrantMutation = useDeleteManoeuvrant();

  // New session form
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [sessionNom, setSessionNom] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionDateDebut, setSessionDateDebut] = useState('');
  const [sessionDateFin, setSessionDateFin] = useState('');

  // Stagiaire form
  const [stagGradeId, setStagGradeId] = useState('');
  const [stagNom, setStagNom] = useState('');
  const [stagPrenom, setStagPrenom] = useState('');

  // Manoeuvrant form
  const [manoGradeId, setManoGradeId] = useState('');
  const [manoNom, setManoNom] = useState('');
  const [manoPrenom, setManoPrenom] = useState('');
  const [manoPoste, setManoPoste] = useState('');

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim() || !sessionNom.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Le code et le nom de la session sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createSession.mutateAsync({
        code: sessionCode.toUpperCase(),
        nom: sessionNom,
        description: sessionDescription || undefined,
        date_debut: sessionDateDebut || undefined,
        date_fin: sessionDateFin || undefined,
      });
      toast({
        title: 'Session créée',
        description: `La session ${sessionCode} a été créée`,
      });
      setNewSessionOpen(false);
      setSessionCode('');
      setSessionNom('');
      setSessionDescription('');
      setSessionDateDebut('');
      setSessionDateFin('');
      setSelectedSessionId(result.id);
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la création',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (session: SessionFormation) => {
    try {
      await deleteSession.mutateAsync(session.id);
      toast({
        title: 'Session supprimée',
        description: `La session ${session.code} a été supprimée`,
      });
      if (selectedSessionId === session.id) {
        setSelectedSessionId(null);
      }
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const handleAddStagiaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagNom.trim() || !stagPrenom.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Le nom et le prénom sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addStagiaire.mutateAsync({
        grade_id: stagGradeId || null,
        nom: stagNom,
        prenom: stagPrenom,
        session_id: selectedSessionId,
      });
      toast({
        title: 'Stagiaire ajouté',
        description: `${stagNom} ${stagPrenom} a été ajouté à la session`,
      });
      setStagGradeId('');
      setStagNom('');
      setStagPrenom('');
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'ajout',
        variant: 'destructive',
      });
    }
  };

  const handleAddManoeuvrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manoNom.trim() || !manoPrenom.trim() || !manoPoste) {
      toast({
        title: 'Champs requis',
        description: 'Le nom, prénom et poste sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addManoeuvrant.mutateAsync({
        grade_id: manoGradeId || null,
        nom: manoNom,
        prenom: manoPrenom,
        poste: manoPoste,
        session_id: selectedSessionId,
      });
      toast({
        title: 'Manœuvrant ajouté',
        description: `${manoNom} ${manoPrenom} a été ajouté à la session`,
      });
      setManoGradeId('');
      setManoNom('');
      setManoPrenom('');
      setManoPoste('');
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'ajout',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Sessions de Formation
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les sessions de formation avec leurs stagiaires et manœuvrants
            </p>
          </div>
          <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSession}>
                <DialogHeader>
                  <DialogTitle>Créer une session de formation</DialogTitle>
                  <DialogDescription>
                    Exemple : CATE 2026-01, FMA Janvier 2026
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-code">Code *</Label>
                      <Input
                        id="session-code"
                        placeholder="CATE 2026-01"
                        value={sessionCode}
                        onChange={(e) => setSessionCode(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-nom">Nom *</Label>
                      <Input
                        id="session-nom"
                        placeholder="Formation CATE Janvier"
                        value={sessionNom}
                        onChange={(e) => setSessionNom(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-desc">Description</Label>
                    <Textarea
                      id="session-desc"
                      placeholder="Description optionnelle..."
                      value={sessionDescription}
                      onChange={(e) => setSessionDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-debut">Date de début</Label>
                      <Input
                        id="session-debut"
                        type="date"
                        value={sessionDateDebut}
                        onChange={(e) => setSessionDateDebut(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-fin">Date de fin</Label>
                      <Input
                        id="session-fin"
                        type="date"
                        value={sessionDateFin}
                        onChange={(e) => setSessionDateFin(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setNewSessionOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createSession.isPending}>
                    {createSession.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Créer la session
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions list */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Sessions ({sessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 text-sm">
                    Aucune session créée
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSessionId === session.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm">{session.code}</div>
                          <div className="text-xs text-muted-foreground">{session.nom}</div>
                          {session.date_debut && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.date_debut).toLocaleDateString('fr-FR')}
                              {session.date_fin && ` - ${new Date(session.date_fin).toLocaleDateString('fr-FR')}`}
                            </div>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette session ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                La session {session.code} sera supprimée. Les stagiaires et manœuvrants associés seront détachés mais pas supprimés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSession(session)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session detail */}
          <div className="lg:col-span-2">
            {!selectedSession ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Sélectionnez une session pour voir et gérer son personnel
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline" className="text-base font-semibold">
                            {selectedSession.code}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">{selectedSession.nom}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {stagiaires.length} stagiaires
                        </Badge>
                        <Badge variant="secondary">
                          <UserCog className="w-3 h-3 mr-1" />
                          {manoeuvrants.length} manœuvrants
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

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
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Ajouter un stagiaire</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddStagiaire} className="flex gap-3 items-end flex-wrap">
                          <div className="space-y-1.5 min-w-[120px]">
                            <Label htmlFor="stag-grade" className="text-xs">Grade</Label>
                            <Select value={stagGradeId} onValueChange={setStagGradeId}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade.id} value={grade.id}>
                                    {grade.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-[120px]">
                            <Label htmlFor="stag-nom" className="text-xs">Nom *</Label>
                            <Input
                              id="stag-nom"
                              placeholder="DUPONT"
                              value={stagNom}
                              onChange={(e) => setStagNom(e.target.value)}
                              className="uppercase h-9"
                            />
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-[120px]">
                            <Label htmlFor="stag-prenom" className="text-xs">Prénom *</Label>
                            <Input
                              id="stag-prenom"
                              placeholder="Jean"
                              value={stagPrenom}
                              onChange={(e) => setStagPrenom(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <Button type="submit" size="sm" disabled={addStagiaire.isPending}>
                            {addStagiaire.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        {loadingStagiaires ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : stagiaires.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            Aucun stagiaire dans cette session
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
                                        onClick={() => deleteStagiaireMutation.mutate(stagiaire.id)}
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
                  </TabsContent>

                  {/* MANOEUVRANTS TAB */}
                  <TabsContent value="manoeuvrants" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Ajouter un manœuvrant</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddManoeuvrant} className="flex gap-3 items-end flex-wrap">
                          <div className="space-y-1.5 min-w-[100px]">
                            <Label htmlFor="mano-grade" className="text-xs">Grade</Label>
                            <Select value={manoGradeId} onValueChange={setManoGradeId}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade.id} value={grade.id}>
                                    {grade.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-[100px]">
                            <Label htmlFor="mano-nom" className="text-xs">Nom *</Label>
                            <Input
                              id="mano-nom"
                              placeholder="MARTIN"
                              value={manoNom}
                              onChange={(e) => setManoNom(e.target.value)}
                              className="uppercase h-9"
                            />
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-[100px]">
                            <Label htmlFor="mano-prenom" className="text-xs">Prénom *</Label>
                            <Input
                              id="mano-prenom"
                              placeholder="Pierre"
                              value={manoPrenom}
                              onChange={(e) => setManoPrenom(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5 min-w-[140px]">
                            <Label htmlFor="mano-poste" className="text-xs">Poste *</Label>
                            <Select value={manoPoste} onValueChange={setManoPoste}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Poste" />
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
                          <Button type="submit" size="sm" disabled={addManoeuvrant.isPending}>
                            {addManoeuvrant.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        {loadingManoeuvrants ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : manoeuvrants.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            Aucun manœuvrant dans cette session
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
                                  <Badge variant="outline" className="text-xs">
                                    {mano.poste}
                                  </Badge>
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
                                        onClick={() => deleteManoeuvrantMutation.mutate(mano.id)}
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
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
