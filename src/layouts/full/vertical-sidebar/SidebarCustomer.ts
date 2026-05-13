import {
  LayoutDashboardIcon, FileDollarIcon, ClockIcon, CheckIcon, CurrencyDollarIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
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
}

const SidebarCustomer: menu[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    BgColor: 'primary',
    to: '/portal/dashboard',
  },

  { header: 'Jobs' },

  {
    title: 'Estimate',
    icon: FileDollarIcon,
    BgColor: 'warning',
    to: '/portal/jobs-estimate',
  },

  {
    title: 'In Progress',
    icon: ClockIcon,
    BgColor: 'primary',
    to: '/portal/jobs-in-progress',
  },

  {
    title: 'Completed',
    icon: CheckIcon,
    BgColor: 'success',
    to: '/portal/jobs-completed',
  },

  {
    title: 'Debt',
    icon: CurrencyDollarIcon,
    BgColor: 'error',
    to: '/portal/jobs-debt',
  },

//   { header: 'Customers' },

//   {
//     title: "Customers",
//     icon: UserPlusIcon,
//     BgColor: 'primary',
//     to: "/customers",
//     module: "Customers",
//   },

];


export default SidebarCustomer;


