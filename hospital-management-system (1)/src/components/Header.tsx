
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Page } from '../types';

export const Header = () => {
    const { navigate, currentPage } = useAppContext();

    const NavLink = ({ page, children }: { page: Page, children: React.ReactNode }) => (
        <button
            onClick={() => navigate(page)}
            className="text-gray-600 hover:text-primary-dark transition-colors duration-300"
        >
            {children}
        </button>
    );

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <h1 className="text-2xl font-bold text-primary-dark cursor-pointer" onClick={() => navigate(Page.Home)}>
                            Hospital Management System
                        </h1>
                    </div>
                    { (currentPage === Page.Home || currentPage === Page.Login || currentPage === Page.Register) && (
                        <nav className="hidden md:flex md:space-x-8">
                            <NavLink page={Page.Home}>Home</NavLink>
                            <a href="#about" className="text-gray-600 hover:text-primary-dark transition-colors duration-300">About</a>
                            <a href="#contact" className="text-gray-600 hover:text-primary-dark transition-colors duration-300">Contact</a>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
};
