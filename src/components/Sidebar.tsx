import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { 
  Notebook24Regular,
  Document24Regular,
  Search24Regular,
  Settings24Regular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  sidebar: {
    width: '240px',
    height: '100vh',
    backgroundColor: 'var(--colorNeutralBackground2)',
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('12px', '8px'),
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ...shorthands.padding('12px', '16px'),
    marginBottom: '12px',
    '& span': {
      fontSize: tokens.fontSizeBase500,
      fontWeight: tokens.fontWeightSemibold,
    },
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    ...shorthands.padding('10px', '16px'),
    ...shorthands.borderRadius('6px'),
    color: 'var(--colorNeutralForeground1)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    '& span': {
      fontSize: tokens.fontSizeBase300,
      fontWeight: tokens.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3Hover)',
      transform: 'translateX(2px)',
    },
    '&:active': {
      backgroundColor: 'var(--colorNeutralBackground3Pressed)',
      transform: 'translateX(0)',
    },
  },
  navItemActive: {
    backgroundColor: 'var(--colorNeutralBackground3Selected)',
    fontWeight: tokens.fontWeightSemibold,
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3Selected)',
    },
  },
  footer: {
    marginTop: 'auto',
    ...shorthands.padding('12px', '16px'),
    borderTop: `1px solid var(--colorNeutralStroke1)`,
  },
});

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const styles = useStyles();

  const menuItems = [
    { label: 'Notebooks', icon: <Notebook24Regular /> },
    { label: 'Documents', icon: <Document24Regular /> },
    { label: 'Search', icon: <Search24Regular /> },
    { label: 'Settings', icon: <Settings24Regular /> },
  ];

  return (
    <div className={styles.sidebar} data-testid="sidebar">
      <div className={styles.logo} data-testid="sidebar-logo">
        <span>My App</span>
      </div>
      <nav className={styles.nav} data-testid="sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`${styles.navItem} ${index === 0 ? styles.navItemActive : ''}`}
            data-testid={`nav-item-${index}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className={styles.footer} data-testid="sidebar-footer">
        {/* Footer content */}
      </div>
    </div>
  );
};

export default Sidebar;