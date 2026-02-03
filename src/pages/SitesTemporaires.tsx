import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPinned, Plus, Pencil, Trash2, MapPin, Loader2 } from 'lucide-react';
import {
  useSitesTemporaires,
  useCreateSiteTemporaire,
  useUpdateSiteTemporaire,
  useDeleteSiteTemporaire,
  type SiteTemporaire,
} from '@/hooks/useSitesTemporaires';
import { useCommunes } from '@/hooks/useReferenceData';
import { useToast } from '@/hooks/use-toast';

export default function SitesTemporaires() {
  const { data: sites = [], isLoading, error } = useSitesTemporaires();
  const { data: communes = [] } = useCommunes();
  const createSite = useCreateSiteTemporaire();
  const updateSite = useUpdateSiteTemporaire();
  const deleteSite = useDeleteSiteTemporaire();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteTemporaire | null>(null);
  const [deletingSite, setDeletingSite] = useState<SiteTemporaire | null>(null);

  // Form state
  const [formNom, setFormNom] = useState('');
  const [formAdresse, setFormAdresse] = useState('');
  const [formCommuneId, setFormCommuneId] = useState('');
  const [formComplement, setFormComplement] = useState('');

  const resetForm = () => {
    setFormNom('');
    setFormAdresse('');
    setFormCommuneId('');
    setFormComplement('');
    setEditingSite(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (site: SiteTemporaire) => {
    setEditingSite(site);
    setFormNom(site.nom);
    setFormAdresse(site.adresse || '');
    setFormCommuneId(site.commune_id || '');
    setFormComplement(site.complement || '');
    setDialogOpen(true);
  };

  const openDeleteDialog = (site: SiteTemporaire) => {
    setDeletingSite(site);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formNom.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du site est obligatoire',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSite) {
        await updateSite.mutateAsync({
          id: editingSite.id,
          nom: formNom.trim(),
          adresse: formAdresse.trim(),
          commune_id: formCommuneId || undefined,
          complement: formComplement.trim(),
        });
        toast({ title: 'Succès', description: 'Site modifié avec succès' });
      } else {
        await createSite.mutateAsync({
          nom: formNom.trim(),
          adresse: formAdresse.trim(),
          commune_id: formCommuneId || undefined,
          complement: formComplement.trim(),
        });
        toast({ title: 'Succès', description: 'Site créé avec succès' });
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSite) return;

    try {
      await deleteSite.mutateAsync(deletingSite.id);
      toast({ title: 'Succès', description: 'Site supprimé avec succès' });
      setDeleteDialogOpen(false);
      setDeletingSite(null);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  const filteredSites = sites.filter((site) => {
    const searchLower = search.toLowerCase();
    return (
      site.nom.toLowerCase().includes(searchLower) ||
      site.commune?.nom?.toLowerCase().includes(searchLower) ||
      site.adresse?.toLowerCase().includes(searchLower)
    );
  });

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Erreur de chargement des sites temporaires</div>
        </div>
      </AppLayout>
    );
  }

  const isPending = createSite.isPending || updateSite.isPending;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPinned className="w-6 h-6 text-primary" />
              Sites temporaires
            </h1>
            <p className="text-muted-foreground mt-1">
              {sites.length} site{sites.length > 1 ? 's' : ''} temporaire
              {sites.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un site
          </Button>
        </div>

        <Input
          placeholder="Rechercher un site par nom, commune ou adresse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map((site) => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-start justify-between gap-2">
                    <span className="line-clamp-2">{site.nom}</span>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(site)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(site)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      {site.adresse && <div>{site.adresse}</div>}
                      {site.commune && (
                        <div className="font-medium">
                          {site.commune.code_postal} {site.commune.nom}
                        </div>
                      )}
                    </div>
                  </div>

                  {site.complement && (
                    <div className="text-xs p-2 rounded bg-muted/50 border text-muted-foreground">
                      {site.complement}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSites.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'Aucun site trouvé pour cette recherche' : 'Aucun site temporaire enregistré'}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSite ? 'Modifier le site' : 'Ajouter un site temporaire'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du site *</Label>
              <Input
                id="nom"
                value={formNom}
                onChange={(e) => setFormNom(e.target.value)}
                placeholder="Ex: Marché de Noël Place de la Mairie"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formAdresse}
                onChange={(e) => setFormAdresse(e.target.value)}
                placeholder="Ex: 12 Place de la Mairie"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commune">Commune</Label>
              <Select value={formCommuneId} onValueChange={setFormCommuneId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une commune" />
                </SelectTrigger>
                <SelectContent>
                  {communes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Renseignements complémentaires</Label>
              <Textarea
                id="complement"
                value={formComplement}
                onChange={(e) => setFormComplement(e.target.value)}
                placeholder="Informations particulières, consignes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingSite ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce site ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le site "{deletingSite?.nom}" ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSite.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
