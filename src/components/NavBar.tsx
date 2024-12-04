// src/components/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavBarContainer = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem;
  background-color: #121212;
  color: white;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: white;
  font-size: 1.2rem;
  &:hover {
    text-decoration: underline;
  }
`;

const NavBar: React.FC = () => {
  return (
    <NavBarContainer>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/detected-objects">Detected Objects</NavLink>
      <NavLink to="/find-object">Find Object</NavLink>
    </NavBarContainer>
  );
};

export default NavBar;