import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: "Produit",
      links: [
        { name: "Fonctionnalités", href: "#features" },
        { name: "Tarifs", href: "#pricing" },
        { name: "Démo", href: "#demo" },
        { name: "Intégrations", href: "/integrations" }
      ]
    },
    company: {
      title: "Entreprise", 
      links: [
        { name: "À propos", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Carrières", href: "/careers" },
        { name: "Contact", href: "/contact" }
      ]
    },
    resources: {
      title: "Ressources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Guides", href: "/guides" },
        { name: "Templates", href: "/templates" },
        { name: "Webinaires", href: "/webinars" }
      ]
    },
    support: {
      title: "Support",
      links: [
        { name: "Centre d'aide", href: "/help" },
        { name: "FAQ", href: "#faq" },
        { name: "Statut", href: "/status" },
        { name: "Support", href: "/support" }
      ]
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-6 gap-8">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <Link href="/" className="font-bold text-2xl mb-4 block">
                <span className="text-violet-400">MarketPlan</span> IA
              </Link>
              <p className="text-slate-400 mb-6 max-w-md">
                L'outil intelligent qui transforme vos idées en stratégie marketing complète. 
                Créez, planifiez et exportez votre plan marketing en quelques minutes.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.098.119.112.223.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([key, section]) => (
                <div key={key}>
                  <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href}
                          className="text-slate-400 hover:text-white transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h4 className="text-lg font-semibold text-white mb-2">
                Restez informé des nouvelles fonctionnalités
              </h4>
              <p className="text-slate-400">
                Recevez nos conseils marketing et les dernières mises à jour produit
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:max-w-md">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors duration-200"
              />
              <button className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors duration-200 whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} MarketPlan IA. Tous droits réservés.
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors duration-200">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors duration-200">
                Conditions d'utilisation
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors duration-200">
                Politique des cookies
              </Link>
              <Link href="/legal" className="text-slate-400 hover:text-white transition-colors duration-200">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;