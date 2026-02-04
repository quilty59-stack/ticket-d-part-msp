import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveSessionsFormation, useStagiairesBySession, useManoeuvrantsBySession } from '@/hooks/useSessionsFormation';
import { useAffectationStats } from '@/hooks/useAffectationStats';
import { BarChart3, Search, Users, GraduationCap, Wrench, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Statistiques() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: sessions = [] } = useActiveSessionsFormation();
  const { data: stagiaires = [] } = useStagiairesBySession(selectedSessionId);
  const { data: manoeuvrants = [] } = useManoeuvrantsBySession(selectedSessionId);
  const { personnelStats, globalStats, isLoading } = useAffectationStats(selectedSessionId);

  // Combine and filter personnel with stats
  const personnelWithStats = useMemo(() => {
    const result: Array<{
      id: string;
      ref: string;
      type: 'stagiaire' | 'manoeuvrant';
      nom: string;
      prenom: string;
      grade: string;
      sessionCode?: string;
      stats: { CA: number; COND: number; CE: number; EQ: number; total: number; lastAssignment?: string };
    }> = [];

    stagiaires.forEach((s) => {
      const ref = `stagiaire:${s.id}`;
      const stats = personnelStats[ref] || { CA: 0, COND: 0, CE: 0, EQ: 0, total: 0 };
      result.push({
        id: s.id,
        ref,
        type: 'stagiaire',
        nom: s.nom,
        prenom: s.prenom,
        grade: s.grades?.code || '',
        sessionCode: s.sessions_formation?.code,
        stats,
      });
    });

    manoeuvrants.forEach((m) => {
      const ref = `manoeuvrant:${m.id}`;
      const stats = personnelStats[ref] || { CA: 0, COND: 0, CE: 0, EQ: 0, total: 0 };
      result.push({
        id: m.id,
        ref,
        type: 'manoeuvrant',
        nom: m.nom,
        prenom: m.prenom,
        grade: m.grades?.code || '',
        sessionCode: m.sessions_formation?.code,
        stats,
      });
    });

    // Filter by search term
    const filtered = result.filter((p) => {
      const fullName = `${p.nom} ${p.prenom}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });

    // Sort by total (ascending - those with fewer assignments first)
    return filtered.sort((a, b) => a.stats.total - b.stats.total);
  }, [stagiaires, manoeuvrants, personnelStats, searchTerm]);

  const statsStagiaires = personnelWithStats.filter((p) => p.type === 'stagiaire');
  const statsManoeuvrants = personnelWithStats.filter((p) => p.type === 'manoeuvrant');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Statistiques des piquets
            </h1>
            <p className="text-muted-foreground">
              Suivi des affectations par agent et par session
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedSessionId || 'all'}
              onValueChange={(v) => setSelectedSessionId(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Sélectionner une session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sessions</SelectItem>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.code} - {session.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total affectations</span>
              </div>
              <p className="text-2xl font-bold mt-1">{globalStats.totalAffectations}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-600 font-medium">COND</div>
              <p className="text-2xl font-bold text-blue-700">{globalStats.byPoste.COND || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4">
              <div className="text-sm text-orange-600 font-medium">CE</div>
              <p className="text-2xl font-bold text-orange-700">{globalStats.byPoste.CE || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="text-sm text-green-600 font-medium">EQ</div>
              <p className="text-2xl font-bold text-green-700">{globalStats.byPoste.EQ || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="text-sm text-purple-600 font-medium">CA</div>
              <p className="text-2xl font-bold text-purple-700">{globalStats.byPoste.CA || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stagiaires">
          <TabsList>
            <TabsTrigger value="stagiaires" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Stagiaires ({statsStagiaires.length})
            </TabsTrigger>
            <TabsTrigger value="manoeuvrants" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Manœuvrants ({statsManoeuvrants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stagiaires" className="mt-4">
            <StatsTable personnel={statsStagiaires} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="manoeuvrants" className="mt-4">
            <StatsTable personnel={statsManoeuvrants} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

interface StatsTableProps {
  personnel: Array<{
    id: string;
    nom: string;
    prenom: string;
    grade: string;
    sessionCode?: string;
    stats: { CA: number; COND: number; CE: number; EQ: number; total: number; lastAssignment?: string };
  }>;
  isLoading: boolean;
}

function StatsTable({ personnel, isLoading }: StatsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Chargement des statistiques...
        </CardContent>
      </Card>
    );
  }

  if (personnel.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun agent trouvé
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Session</TableHead>
            <TableHead className="text-center w-20 bg-blue-50">COND</TableHead>
            <TableHead className="text-center w-20 bg-orange-50">CE</TableHead>
            <TableHead className="text-center w-20 bg-green-50">EQ</TableHead>
            <TableHead className="text-center w-20 bg-purple-50">CA</TableHead>
            <TableHead className="text-center w-24">Total</TableHead>
            <TableHead>Dernière affectation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personnel.map((person, index) => (
            <TableRow 
              key={person.id}
              className={index === 0 ? 'bg-amber-50' : undefined}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {person.grade}
                  </span>
                  {person.nom} {person.prenom}
                  {index === 0 && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-100 text-[10px]">
                      Prioritaire
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {person.sessionCode && (
                  <span className="text-xs px-2 py-1 rounded bg-muted">
                    {person.sessionCode}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold ${person.stats.COND > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                  {person.stats.COND}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold ${person.stats.CE > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {person.stats.CE}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold ${person.stats.EQ > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {person.stats.EQ}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold ${person.stats.CA > 0 ? 'text-purple-600' : 'text-muted-foreground'}`}>
                  {person.stats.CA}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="font-bold">
                  {person.stats.total}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {person.stats.lastAssignment
                  ? format(new Date(person.stats.lastAssignment), 'dd/MM/yyyy', { locale: fr })
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
