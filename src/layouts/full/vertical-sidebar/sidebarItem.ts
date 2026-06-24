import {
  LayoutDashboardIcon, BriefcaseIcon, CalculatorIcon, ShoppingCartPlusIcon, UserPlusIcon, 
  ToolsIcon, SettingsIcon, HierarchyIcon, UsersIcon, ShieldLockIcon, CarIcon,
  PackageIcon, ShoppingCartIcon, BrandGoogleDriveIcon, ClockIcon, CalendarIcon,
  ListCheckIcon, FileDollarIcon, ClipboardCheckIcon, ToolIcon, ReceiptIcon, PercentageIcon,
  ArchiveIcon, ChartBarIcon, HeartPlusIcon, UserSearchIcon, ReportMedicalIcon, CurrencyDollarIcon,
  HealthRecognitionIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  module?: string;
  icon?: any;
  to?: string;
  chip?: string;
  BgColor?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  masterOnly?: boolean;
}

const sidebarItem: menu[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    BgColor: 'primary',
    to: '/dashboard',
  },

  { header: 'SaaS Admin', masterOnly: true },
  {
    title: 'Empresas / Clientes',
    icon: HierarchyIcon,
    BgColor: 'primary',
    to: '/saas/tenants',
    masterOnly: true
  },
  {
    title: 'Gestionar Masters',
    icon: ShieldLockIcon,
    BgColor: 'primary',
    to: '/saas/masters',
    masterOnly: true
  },

  { header: 'Cotizaciones' },
  
  {
    title: "Cotizaciones",
    icon: CurrencyDollarIcon,
    BgColor: 'primary',
    to: "/quotes",
    module: "Listado de Cotizaciones",
  },
  {
    title: "Configurar Cotización",
    icon: SettingsIcon,
    BgColor: 'primary',
    to: "/quotes/config",
    module: "Listado de Cotizaciones",
  },

  { header: 'Agenda' },

  {
    title: "Agendamiento de Citas",
    icon: CalendarIcon,
    BgColor: 'primary',
    to: "/appointments",
    module: "Agendamiento de Citas",
  },

  { header: 'Historias Clínicas' },
  
  {
    title: "Historias Clínicas",
    icon: HealthRecognitionIcon,
    BgColor: 'primary',
    to: "/medical-history",
    module: "Listado de Historias Clinicas",
  },

  { header: 'Clientes y Eps' },
  
  {
    title: "Eps",
    icon: HeartPlusIcon,
    BgColor: 'primary',
    to: "/eps",
    module: "Listado de Eps",
  },

  {
    title: "Clientes",
    icon: UserSearchIcon,
    BgColor: 'primary',
    to: "/customers",
    module: "Clientes",
  },

  { header: 'Procedimientos' },
  
  {
    title: "Procedimientos",
    icon: ReportMedicalIcon,
    BgColor: 'primary',
    to: "/procedures",
    module: "Listado de Procedimientos",
  },

  { header: 'Usuarios y Roles' },
  
  {
    title: "Usuarios",
    icon: UsersIcon,
    BgColor: 'primary',
    to: "/users",
    module: "Listado de Usuarios",
  },

  {
    title: "Roles",
    icon: ShieldLockIcon,
    BgColor: 'primary',
    to: "/roles",
    module: "Modulo de Roles",
  },

  { header: 'Configuración' },

  {
    title: "Sistema",
    icon: SettingsIcon,
    BgColor: 'primary',
    to: "/systemconfig",
    module: "Sistema",
  },

  {
    title: "Historico de Accesos",
    icon: ListCheckIcon,
    BgColor: 'primary',
    to: "/access-logs",
    module: "Historial de Accesos",
  },

];


export default sidebarItem;
//   { header: 'Ui components' },
//   {
//     title: "Alert",
//     icon: AlertCircleIcon,
//     BgColor: 'primary',
//     to: "/ui/alerts",
    
//   },
//   {
//     title: "Button",
//     icon: CircleDotIcon,
//     BgColor: 'primary',
//     to: "/ui/buttons",
//   },
//   {
//     title: "Cards",
//     icon: BoxMultiple1Icon,
//     BgColor: 'primary',
//     to: "/ui/cards",
//   },
//   {
//     title: "Tables",
//     icon: BorderAllIcon,
//     BgColor: 'primary',
//     to: "/ui/tables",
//   },

//   { header: 'Auth' },
//   {
//     title: 'Login',
//     icon: LoginIcon,
//     BgColor: 'primary',
//     to: '/auth/login'
// },
// {
//     title: 'Register',
//     icon: UserPlusIcon,
//     BgColor: 'primary',
//     to: '/auth/register'
// },
// { header: 'Extra' },
// {
//     title: 'Icons',
//     icon: MoodHappyIcon,
//     BgColor: 'primary',
//     to: '/icons'
// },
// {
//     title: 'Sample Page',
//     icon: ApertureIcon,
//     BgColor: 'primary',
//     to: '/sample-page'
// },


