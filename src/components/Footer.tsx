import React from 'react';

const Footer = () => {
    return (
        <footer className="py-8 border-t bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 text-center">
                <p className="text-muted-foreground text-sm">
                    Contact us: <a href="mailto:smarteats.team@gmail.com" className="text-cta hover:text-cta/80 transition-colors font-medium">smarteats.team@gmail.com</a>
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                    © {new Date().getFullYear()} SmartEats. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
