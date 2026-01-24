-- ============================================
-- PWA TICKETS DE DÉPART SDIS 71
-- Migration complète du schéma et données
-- ============================================

-- 1. Création du type ENUM pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Table des rôles utilisateurs (sécurité)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction de vérification des rôles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Table des profils utilisateurs
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger pour créer le profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Attribuer le rôle user par défaut
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Table des grades
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    libelle VARCHAR(50) NOT NULL,
    ordre INTEGER NOT NULL DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grades are viewable by all authenticated" ON public.grades
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage grades" ON public.grades
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Table des centres
CREATE TABLE public.centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    commune VARCHAR(100),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Centres are viewable by all authenticated" ON public.centres
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage centres" ON public.centres
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Table des catégories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    couleur VARCHAR(7) DEFAULT '#2196F3',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by all authenticated" ON public.categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Table des communes (sans contrainte UNIQUE sur code)
CREATE TABLE public.communes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20),
    nom VARCHAR(100) NOT NULL,
    code_postal VARCHAR(10),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communes are viewable by all authenticated" ON public.communes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage communes" ON public.communes
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Table des natures d'intervention
CREATE TABLE public.natures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    categorie_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.natures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Natures are viewable by all authenticated" ON public.natures
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage natures" ON public.natures
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Table des types de lieux
CREATE TABLE public.types_lieux (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle VARCHAR(100) NOT NULL,
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.types_lieux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Types lieux are viewable by all authenticated" ON public.types_lieux
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage types lieux" ON public.types_lieux
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Table des types de voies
CREATE TABLE public.types_voies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle VARCHAR(100) NOT NULL,
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.types_voies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Types voies are viewable by all authenticated" ON public.types_voies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage types voies" ON public.types_voies
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Table des origines d'appel
CREATE TABLE public.origines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle VARCHAR(100) NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.origines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Origines are viewable by all authenticated" ON public.origines
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage origines" ON public.origines
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 12. Table des véhicules
CREATE TABLE public.vehicules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50),
    immatriculation VARCHAR(50),
    centre_id UUID REFERENCES public.centres(id) ON DELETE SET NULL,
    taille_equipage INTEGER NOT NULL DEFAULT 3,
    postes JSONB NOT NULL DEFAULT '{"CA": 1, "COND": 1, "CE": 1}'::jsonb,
    talkgroup VARCHAR(20),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicules are viewable by all authenticated" ON public.vehicules
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage vehicules" ON public.vehicules
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. Table du personnel permanent
CREATE TABLE public.personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule VARCHAR(20) UNIQUE,
    grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    centre_id UUID REFERENCES public.centres(id) ON DELETE SET NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Personnel is viewable by all authenticated" ON public.personnel
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage personnel" ON public.personnel
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 14. Table des stagiaires
CREATE TABLE public.stagiaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_ajout DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stagiaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stagiaires are viewable by all authenticated" ON public.stagiaires
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage stagiaires" ON public.stagiaires
    FOR ALL TO authenticated USING (true);

-- 15. Table des tickets de départ
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    num_inter VARCHAR(50) UNIQUE NOT NULL,
    date_intervention TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Origine
    origine_id UUID REFERENCES public.origines(id) ON DELETE SET NULL,
    
    -- Localisation
    commune_id UUID REFERENCES public.communes(id) ON DELETE SET NULL,
    type_lieu_id UUID REFERENCES public.types_lieux(id) ON DELETE SET NULL,
    num_voie VARCHAR(20),
    type_voie_id UUID REFERENCES public.types_voies(id) ON DELETE SET NULL,
    nom_voie VARCHAR(200),
    complement_adresse TEXT,
    coordonnees VARCHAR(100),
    
    -- Nature
    categorie_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    nature_id UUID REFERENCES public.natures(id) ON DELETE SET NULL,
    complement_nature TEXT,
    
    -- Informations
    rens_compl TEXT,
    appelant VARCHAR(200),
    victime VARCHAR(200),
    pts_eau_indispo TEXT,
    transit VARCHAR(100),
    
    -- Communication
    talkgroup VARCHAR(20),
    renfort VARCHAR(200),
    
    -- Moyens et équipages (JSONB)
    moyens JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Métadonnées
    etat VARCHAR(20) DEFAULT 'brouillon',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tickets are viewable by all authenticated" ON public.tickets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets" ON public.tickets
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete tickets" ON public.tickets
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers pour updated_at
CREATE TRIGGER update_vehicules_updated_at
    BEFORE UPDATE ON public.vehicules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at
    BEFORE UPDATE ON public.personnel
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour générer le numéro d'intervention
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    today_count INTEGER;
    date_part TEXT;
BEGIN
    date_part := to_char(NEW.date_intervention, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO today_count
    FROM public.tickets
    WHERE num_inter LIKE date_part || '-%';
    
    NEW.num_inter := date_part || '-' || LPAD(today_count::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    WHEN (NEW.num_inter IS NULL OR NEW.num_inter = '')
    EXECUTE FUNCTION public.generate_ticket_number();

-- ============================================
-- DONNÉES DE RÉFÉRENCE (SEED DATA)
-- ============================================

-- Grades
INSERT INTO public.grades (code, libelle, ordre) VALUES
    ('SAP', 'Sapeur', 1),
    ('CAP', 'Caporal', 2),
    ('SGT', 'Sergent', 3),
    ('ADJ', 'Adjudant', 4),
    ('FOR', 'Formateur', 5),
    ('LTN', 'Lieutenant', 6),
    ('CNE', 'Capitaine', 7);

-- Centres
INSERT INTO public.centres (code, nom) VALUES
    ('CFD', 'Centre de Formation Départemental'),
    ('BUXY', 'Centre de BUXY'),
    ('CHALON', 'Centre de CHALON'),
    ('DIGOIN', 'Centre de DIGOIN'),
    ('LOUHANS', 'Centre de LOUHANS'),
    ('ROMENAY', 'Centre de ROMENAY');

-- Catégories
INSERT INTO public.categories (code, libelle, couleur) VALUES
    ('SUAP', 'SUAP', '#2196F3'),
    ('Accident', 'Accident', '#FF9800'),
    ('Incendie', 'Incendie', '#F44336'),
    ('Operations_diverses', 'Opérations diverses', '#9C27B0'),
    ('NRBCE', 'NRBCE', '#FFEB3B'),
    ('Prestations_payantes', 'Prestations payantes', '#4CAF50');

-- Types de lieux
INSERT INTO public.types_lieux (libelle, ordre) VALUES
    ('VOIE PUBLIQUE', 1),
    ('LIEU PUBLIC', 2),
    ('DOMICILE', 3),
    ('ETABLISSEMENT', 4);

-- Types de voies
INSERT INTO public.types_voies (libelle, ordre) VALUES
    ('RUE', 1),
    ('ROUTE', 2),
    ('BOULEVARD', 3),
    ('CHEMIN', 4),
    ('AVENUE', 5),
    ('PLACE', 6),
    ('IMPASSE', 7),
    ('ALLÉE', 8),
    ('RESIDENCE', 9),
    ('ROND POINT', 10),
    ('GARE', 11);

-- Origines
INSERT INTO public.origines (libelle) VALUES
    ('Initial CTA'),
    ('Demande directe'),
    ('Autre service'),
    ('Police'),
    ('Gendarmerie'),
    ('SAMU');

-- Communes (197 communes de Saône-et-Loire - noms uniquement, pas de contrainte unique sur code)
INSERT INTO public.communes (nom) VALUES
    ('HURIGNY'),
    ('SANCÉ'),
    ('L''ABERGEMENT DE CUISERY'),
    ('L''ABERGEMENT SAINTE COLOMBE'),
    ('ALLERIOT'),
    ('ALUZE'),
    ('ANGLURE SOUS DUN'),
    ('ANTULLY'),
    ('ANZY LE DUC'),
    ('ARTAIX'),
    ('AUTHUMES'),
    ('AUTUN'),
    ('AUXONNE'),
    ('AVRILLY'),
    ('AZÉ'),
    ('BALANOD'),
    ('BALLORE'),
    ('BANNIÈRES'),
    ('BARNAY'),
    ('BARON'),
    ('BAUDRIÈRES'),
    ('BAUGY'),
    ('BEAUMONT SUR GROSNE'),
    ('BEAUREPAIRE EN BRESSE'),
    ('BELLEVESVRE'),
    ('BERGESSERIN'),
    ('BERNA'),
    ('BERZÉ LA VILLE'),
    ('BERZÉ LE CHÂTEL'),
    ('BISSY LA MÂCONNAISE'),
    ('BISSY SOUS UXELLES'),
    ('BLANOT'),
    ('BLANZY'),
    ('BOURG LE COMTE'),
    ('BOURGVILAIN'),
    ('BOYER'),
    ('BRANCION'),
    ('BRAY'),
    ('BREUIL'),
    ('BRION'),
    ('BROCHES'),
    ('BROSSAINC'),
    ('BRUAILLES'),
    ('BUFFIÈRES'),
    ('BURGY'),
    ('BUXY'),
    ('CABAS'),
    ('CÉRON'),
    ('CHAGNY'),
    ('CHALON SUR SAÔNE'),
    ('CHAMBILLY'),
    ('CHAMPAGNAT'),
    ('CHAPAIZE'),
    ('CHARLIEU'),
    ('CHARNAY LÈS MÂCON'),
    ('CHAROLLES'),
    ('CHASSEY LE CAMP'),
    ('CHASSIGNY SOUS DUN'),
    ('CHÂTEAU'),
    ('CHÂTENOY LE ROYAL'),
    ('CHÂTILLON EN BAZOIS'),
    ('CHAUFFAILLES'),
    ('CHENÔVE'),
    ('CHÉRIZET'),
    ('CHEVAGNY LES CHEVRIÈRES'),
    ('CHISSEY LÈS MÂCON'),
    ('CIRY LE NOBLE'),
    ('CLERMONT'),
    ('CLESSÉ'),
    ('CLUNY'),
    ('COLOMBIER EN BRIONNAIS'),
    ('CORMATIN'),
    ('CORTEVAIX'),
    ('COUCHES'),
    ('CRÊCHES SUR SAÔNE'),
    ('CRÉOT'),
    ('CRISSÉ'),
    ('CRUSILLES'),
    ('CUISERY'),
    ('CURGY'),
    ('CUSSY EN MORVAN'),
    ('DAVAYÉ'),
    ('DEMIGNY'),
    ('DIGOIN'),
    ('DOMPIERRE LES ORMES'),
    ('DONZY LE PERTUIS'),
    ('ÉCUELLES'),
    ('ÉCUISSES'),
    ('ÉPERVANS'),
    ('ÉPINAC'),
    ('ESSERTENNE'),
    ('ÉTROITS'),
    ('FARNAY'),
    ('FLAGY'),
    ('FLEURY LA MONTAGNE'),
    ('FLORENTIN'),
    ('FONTAINES'),
    ('FRAGNES'),
    ('FRANGY EN BRESSE'),
    ('FUISSÉ'),
    ('GENELARD'),
    ('GENOUILLY'),
    ('GERMOLLES SUR GROSNE'),
    ('GERVANS'),
    ('GIBLES'),
    ('GIVRY'),
    ('GOURDON'),
    ('GRANGES'),
    ('GRURY'),
    ('GUERFAND'),
    ('GUILLEMAUD'),
    ('GUYONDVAUX'),
    ('HAUTEROCHE'),
    ('HUILLY SUR SEILLE'),
    ('IGORNAY'),
    ('JALOGNY'),
    ('JONCY'),
    ('JOUX LA VILLE'),
    ('LA CROIX BLANCHE'),
    ('LAFONX'),
    ('LAIVES'),
    ('LALHEUE'),
    ('LANCHARRE'),
    ('LE CREUSOT'),
    ('LE PULEY'),
    ('LEXILLEUX'),
    ('LEYNES'),
    ('LOISY'),
    ('LONGEPIERRE'),
    ('LOUHANS'),
    ('LOURNAND'),
    ('MÂCON'),
    ('MAILLY'),
    ('MALAY'),
    ('MANLAY'),
    ('MARINGES'),
    ('MARLY SOUS ISSY'),
    ('MARTAILLY LÈS BRANCION'),
    ('MARY'),
    ('MASSILLY'),
    ('MATOUR'),
    ('MAZILLE'),
    ('MELAY'),
    ('MELLECEY'),
    ('MÉNTREAU'),
    ('MERCUREY'),
    ('MESVRÉE'),
    ('MILLY LAMARTINE'),
    ('MONTBELLET'),
    ('MONTCEAUX L''ÉTOILE'),
    ('MONTCEAU LES MINES'),
    ('MONTSAUCHE LES SETTONS'),
    ('MORGON'),
    ('MORTEAU'),
    ('NANTON'),
    ('NEUVY GRANDCHAMP'),
    ('OZENAY'),
    ('PALINGES'),
    ('PARAY LE MONIAL'),
    ('PARRCAY'),
    ('PERONNE'),
    ('PERRIGNY SUR LOIRE'),
    ('PIERRE DE BRESSE'),
    ('PLOTTES'),
    ('POISSON'),
    ('PRÉTY'),
    ('PRISSÉ'),
    ('PRUZILLY'),
    ('RATENELLE'),
    ('RATTE'),
    ('RECLÉSNE'),
    ('RIGNY SUR ARROUX'),
    ('ROMANÈCHE THORINS'),
    ('ROMENAY'),
    ('ROUGNY'),
    ('RULLY'),
    ('SAILLENARD'),
    ('SAINT AGNAN'),
    ('SAINT ALBAIN'),
    ('SAINT AMBREUIL'),
    ('SAINT ANDRÉ LE DÉSERT'),
    ('SAINT BONNET DE CRAY'),
    ('SAINT BONNET DE JOUX'),
    ('SAINT CHRISTOPHE EN BRIONNAIS'),
    ('SAINT CLÉMENT SUR GUYE'),
    ('SAINT DENIS DE VAUX'),
    ('SAINT DÉSERT'),
    ('SAINT DIDIER EN BRIONNAIS'),
    ('SAINT ÉMILAND'),
    ('SAINT ÉTIENNE EN BRESSE'),
    ('SAINT FIRMIN'),
    ('SAINT FORGEOT'),
    ('SAINT GENGOUX DE SCISSÉ'),
    ('SAINT GENGOUX LE NATIONAL'),
    ('SAINT GERMAIN DU BOIS'),
    ('SAINT GERMAIN DU PLAIN'),
    ('SAINT GERVAIS EN VALLIÈRE'),
    ('SAINT HURUGE'),
    ('SAINT JEAN DE TRÉZY'),
    ('SAINT JEAN DE VAUX'),
    ('SAINT JULIEN DE CIVRY'),
    ('SAINT JULIEN DE JONZY'),
    ('SAINT LAURENT D''ANDENAY'),
    ('SAINT LÉGER DU BOIS'),
    ('SAINT LÉGER LÈS PARAY'),
    ('SAINT LÉGER SOUS BEUVRAY'),
    ('SAINT LÉGER SOUS LA BUSSIÈRE'),
    ('SAINT LOUP GÉANGES'),
    ('SAINT MARCEL'),
    ('SAINT MARD DE VAUX'),
    ('SAINT MARTIN BELLE ROCHE'),
    ('SAINT MARTIN D''AUXY'),
    ('SAINT MARTIN DE COMMUNE'),
    ('SAINT MARTIN DE SALENCEY'),
    ('SAINT MARTIN DU LAC'),
    ('SAINT MARTIN DU MONT'),
    ('SAINT MARTIN DU TARTRE'),
    ('SAINT MARTIN EN BRESSE'),
    ('SAINT MARTIN EN GÂTINOIS'),
    ('SAINT MARTIN SOUS MONTAIGU'),
    ('SAINT MAURICE DE SATONNAY'),
    ('SAINT MAURICE DES CHAMPS'),
    ('SAINT MAURICE LÈS CHÂTEAUNEUF'),
    ('SAINT MICAUD'),
    ('SAINT NIZIER SUR ARROUX'),
    ('SAINT PIERRE DE VARENNES'),
    ('SAINT PIERRE LE VIEUX'),
    ('SAINT POINT'),
    ('SAINT PRIX'),
    ('SAINT RACHO'),
    ('SAINT RÉMY'),
    ('SAINT ROMAIN DES ÎLES'),
    ('SAINT ROMAIN SOUS GOURDON'),
    ('SAINT SERNIN DU BOIS'),
    ('SAINT SERNIN DU PLAIN'),
    ('SAINT SYMPHORIEN D''ANCELLES'),
    ('SAINT SYMPHORIEN DES BOIS'),
    ('SAINT USUGE'),
    ('SAINT VALLERIN'),
    ('SAINT VALLIER'),
    ('SAINT VÉRAND'),
    ('SAINT VINCENT DES PRÉS'),
    ('SAINT VINCENT EN BRESSE'),
    ('SAINT YAN'),
    ('SAISY'),
    ('SALORNAY SUR GUYE'),
    ('SANCY'),
    ('SARRY'),
    ('SASSENAY'),
    ('SASSY'),
    ('SAVIGNY EN REVERMONT'),
    ('SAVILLY'),
    ('SEMUR EN BRIONNAIS'),
    ('SENNECEY LE GRAND'),
    ('SENOZAN'),
    ('SERCY'),
    ('SERRIÈRES'),
    ('SEVREY'),
    ('SIMANDRE'),
    ('SOLOGNY'),
    ('SOLUTRÉ POUILLY'),
    ('SOTTE'),
    ('SULLY'),
    ('TANNAY'),
    ('THUREY'),
    ('IGUERANDE'),
    ('TORCY'),
    ('TORMÉS'),
    ('TOURNUS'),
    ('TRAMAYES'),
    ('TRAMBLY'),
    ('TRIVY'),
    ('UCHIZY'),
    ('VARENNE L''ARCONCE'),
    ('VARENNES LE GRAND'),
    ('VARENNES LÈS MÂCON'),
    ('VARENNES SAINT SAUVEUR'),
    ('VARENNES SOUS DUN'),
    ('VERJUX'),
    ('VERMENTON'),
    ('VÉROSVRES'),
    ('VERZÉ'),
    ('VINZELLES'),
    ('VIRÉ'),
    ('VITRY EN CHAROLLAIS');

-- Natures d'intervention avec leurs catégories
INSERT INTO public.natures (libelle, categorie_id) VALUES
    ('ACR', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('AGRESSION', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('ALLERGIE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('AUTRE NATURE SAP', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('BLESSURE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('BRULURE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('CHUTE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('CRISE CONVULSIVE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('DETRESSE PSYCHOLOGIQUE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('DETRESSE RESPIRATOIRE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('DOULEUR ABDOMINALE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('DOULEUR THORACIQUE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('HEMORRAGIE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('INCONSCIENT', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('INTOXICATION', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('MALAISE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('MATERNITE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('NOYADE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('PERSONNE AGEE VULNERABLE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('PLAIE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('RELEVAGE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('TRAUMATISME CRANE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('TRAUMATISME MEMBRE', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('TRAUMATISME RACHIS', (SELECT id FROM public.categories WHERE code = 'SUAP')),
    ('ACCIDENT DE CIRCULATION', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('ACCIDENT DE TRAVAIL', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('ACCIDENT DOMESTIQUE', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('ACCIDENT FERROVIAIRE', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('ACCIDENT SPORTIF', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('EFFONDREMENT', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('EXPLOSION', (SELECT id FROM public.categories WHERE code = 'Accident')),
    ('FEU AGRICOLE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU BATIMENT TERTIAIRE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU CAVE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU CHEMINEE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU DE FORET', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU DE POUBELLE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU DE VEHICULE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU ERP', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU HABITATION', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU INDUSTRIEL', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU NAV', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('FEU VEGETATION', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('ODEUR SUSPECTE', (SELECT id FROM public.categories WHERE code = 'Incendie')),
    ('ALARME INTRUSION', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('ANIMAL', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('ASCENSEUR BLOQUE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('ASSISTANCE PERSONNE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('AUTRE OPERATION DIVERSE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('DEBORDEMENT EAUX', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('DEGAGEMENT EMPRISE PUBLIQUE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('DEGAGEMENT VOIE PUBLIQUE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('DESTRUCTION HYMENOPTERE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('EFFONDREMENT TERRAIN', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('EPUISEMENT', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('FUITE DE GAZ', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('INONDATION', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('MISE EN SECURITE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('OUVERTURE DE PORTE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('POLLUTION', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('PROTECTION BIENS', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('RECHERCHE PERSONNE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('RECONNAISSANCE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('RECUEIL CORPS', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('SAV AUTORITE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('TEMPETE', (SELECT id FROM public.categories WHERE code = 'Operations_diverses')),
    ('INTERVENTION CHIMIQUE', (SELECT id FROM public.categories WHERE code = 'NRBCE')),
    ('INTERVENTION NUCLEAIRE', (SELECT id FROM public.categories WHERE code = 'NRBCE')),
    ('INTERVENTION RADIOLOGIQUE', (SELECT id FROM public.categories WHERE code = 'NRBCE')),
    ('INTERVENTION BIOLOGIQUE', (SELECT id FROM public.categories WHERE code = 'NRBCE')),
    ('INTERVENTION EXPLOSIVE', (SELECT id FROM public.categories WHERE code = 'NRBCE')),
    ('ALARME INCENDIE ERP', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('ALARME INCENDIE HABITATION', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('ASSISTANCE AMBULANCE', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('DESTRUCTION ANIMAUX', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('DESTRUCTION HYMENOPTERES', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('OUVERTURE PORTE PAYANTE', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('PREVENTION MANIFESTATION', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes')),
    ('TRANSPORT SANITAIRE', (SELECT id FROM public.categories WHERE code = 'Prestations_payantes'));

-- Véhicules
INSERT INTO public.vehicules (code, type, taille_equipage, postes, talkgroup, centre_id) VALUES
    ('VSAV 1', 'VSAV', 3, '{"CA": 1, "COND": 1, "CE": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VSAV 2', 'VSAV', 3, '{"CA": 1, "COND": 1, "CE": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VSAV 3', 'VSAV', 3, '{"CA": 1, "COND": 1, "CE": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VTU 1', 'VTU', 3, '{"CA": 1, "COND": 1, "CE": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VTU 2', 'VTU', 3, '{"CA": 1, "COND": 1, "CE": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('FPTSR', 'FPTSR', 6, '{"CA": 1, "COND": 1, "CE": 2, "EQ": 2}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VL 01', 'VL', 2, '{"CA": 1, "COND": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VL 02', 'VL', 2, '{"CA": 1, "COND": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VTP 1', 'VTP', 6, '{"CA": 1, "COND": 1, "CE": 2, "EQ": 2}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('VTP 2', 'VTP', 6, '{"CA": 1, "COND": 1, "CE": 2, "EQ": 2}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('CCRM', 'CCRM', 6, '{"CA": 1, "COND": 1, "CE": 2, "EQ": 2}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('EP 24', 'EP', 3, '{"CA": 1, "CE": 2}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('CAMAPP', 'CAMAPP', 3, '{"CA": 1, "COND": 1, "CE": 1}'::jsonb, '614', (SELECT id FROM public.centres WHERE code = 'CFD'));

-- Personnel permanent
INSERT INTO public.personnel (matricule, nom, prenom, grade_id, centre_id) VALUES
    ('P0001', 'CAMPANO', 'Loic', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0002', 'COUCAUD', 'Adrien', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0003', 'DOUHERET', 'Jean Christophe', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0004', 'GAMBEY', 'Lenaic', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0005', 'GEOFFROY', 'Anthony', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0006', 'GORCE', 'Josselin', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0007', 'LEPERE', 'Manon', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0008', 'LUKOWITZ', 'Aymeric', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0009', 'MAREY', 'Benjamin', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0010', 'MARQUE', 'Clément', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0011', 'MAUBLANC', 'Aurelien', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD')),
    ('P0012', 'STCHERBININE', 'Jeremy', (SELECT id FROM public.grades WHERE code = 'SGT'), (SELECT id FROM public.centres WHERE code = 'CFD'));