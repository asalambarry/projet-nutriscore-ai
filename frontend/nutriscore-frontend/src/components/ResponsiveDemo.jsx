import { Laptop, Monitor, Smartphone, Tablet } from 'lucide-react';
import './ResponsiveDemo.css';

const ResponsiveDemo = () => {
    return (
        <div className="responsive-demo">
            {/* Header de démonstration */}
            <section className="demo-header section-responsive">
                <div className="container-responsive">
                    <h1 className="text-responsive-xl text-center">
                        🎯 Test Responsive NutriPredict
                    </h1>
                    <p className="text-responsive-base text-center text-secondary">
                        Cette page démontre toutes les fonctionnalités responsive de l'application
                    </p>
                </div>
            </section>

            {/* Test des grilles responsive */}
            <section className="demo-section section-responsive-sm">
                <div className="container-responsive">
                    <h2 className="text-responsive-lg mb-4">Grilles Responsive</h2>

                    <div className="grid-responsive mb-5">
                        <div className="card-responsive">
                            <div className="demo-device">
                                <Monitor size={24} />
                                <h3>Desktop</h3>
                                <p>≥ 992px</p>
                            </div>
                        </div>
                        <div className="card-responsive">
                            <div className="demo-device">
                                <Laptop size={24} />
                                <h3>Tablette L</h3>
                                <p>768px - 991px</p>
                            </div>
                        </div>
                        <div className="card-responsive">
                            <div className="demo-device">
                                <Tablet size={24} />
                                <h3>Tablette</h3>
                                <p>576px - 767px</p>
                            </div>
                        </div>
                        <div className="card-responsive">
                            <div className="demo-device">
                                <Smartphone size={24} />
                                <h3>Mobile</h3>
                                <p>≤ 575px</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Test des composants */}
            <section className="demo-section section-responsive-sm">
                <div className="container-responsive">
                    <h2 className="text-responsive-lg mb-4">Composants Adaptatifs</h2>

                    {/* Navigation responsive */}
                    <div className="demo-component mb-4">
                        <h3 className="mb-2">Navigation</h3>
                        <nav className="nav-responsive card-responsive">
                            <a href="#" className="btn-responsive">Accueil</a>
                            <a href="#" className="btn-responsive">Produits</a>
                            <a href="#" className="btn-responsive">Recherche</a>
                            <a href="#" className="btn-responsive hide-mobile">Avancé</a>
                            <a href="#" className="btn-responsive show-mobile-only">Menu</a>
                        </nav>
                    </div>

                    {/* Formulaire responsive */}
                    <div className="demo-component mb-4">
                        <h3 className="mb-2">Formulaire</h3>
                        <form className="form-responsive card-responsive">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Nom du produit</label>
                                        <input type="text" placeholder="Entrez le nom..." />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Marque</label>
                                        <input type="text" placeholder="Entrez la marque..." />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" placeholder="Description du produit..."></textarea>
                            </div>
                            <button type="submit" className="btn-responsive btn-primary">
                                Valider
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Test des breakpoints */}
            <section className="demo-section section-responsive-sm">
                <div className="container-responsive">
                    <h2 className="text-responsive-lg mb-4">Points de Rupture</h2>

                    <div className="breakpoint-indicators">
                        <div className="breakpoint-card d-xs-block d-sm-none">
                            <div className="indicator active"></div>
                            <span>XS: Mobile Portrait</span>
                            <code>&lt; 576px</code>
                        </div>
                        <div className="breakpoint-card d-none d-sm-block d-md-none">
                            <div className="indicator active"></div>
                            <span>SM: Mobile Paysage</span>
                            <code>576px - 767px</code>
                        </div>
                        <div className="breakpoint-card d-none d-md-block d-lg-none">
                            <div className="indicator active"></div>
                            <span>MD: Tablette</span>
                            <code>768px - 991px</code>
                        </div>
                        <div className="breakpoint-card d-none d-lg-block d-xl-none">
                            <div className="indicator active"></div>
                            <span>LG: Desktop</span>
                            <code>992px - 1199px</code>
                        </div>
                        <div className="breakpoint-card d-none d-xl-block">
                            <div className="indicator active"></div>
                            <span>XL: Large Desktop</span>
                            <code>&gt;= 1200px</code>
                        </div>
                    </div>
                </div>
            </section>

            {/* Test de la typographie fluide */}
            <section className="demo-section section-responsive-sm">
                <div className="container-responsive">
                    <h2 className="text-responsive-lg mb-4">Typographie Fluide</h2>

                    <div className="typography-demo card-responsive">
                        <h1 className="text-responsive-xl">Titre Principal</h1>
                        <h2 className="text-responsive-lg">Sous-titre Important</h2>
                        <p className="text-responsive-base">
                            Ce texte s'adapte automatiquement à la taille de l'écran grâce à la fonction CSS clamp().
                            La taille minimum, idéale et maximum sont définies pour garantir une lisibilité optimale
                            sur tous les appareils.
                        </p>
                    </div>
                </div>
            </section>

            {/* Test des images responsive */}
            <section className="demo-section section-responsive-sm">
                <div className="container-responsive">
                    <h2 className="text-responsive-lg mb-4">Images Adaptatives</h2>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="card-responsive">
                                <div className="img-responsive img-responsive-square demo-image">
                                    <span>Carré 1:1</span>
                                </div>
                                <h4 className="mt-2">Format Carré</h4>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card-responsive">
                                <div className="img-responsive img-responsive-card demo-image">
                                    <span>Carte 4:3</span>
                                </div>
                                <h4 className="mt-2">Format Carte</h4>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card-responsive">
                                <div className="img-responsive img-responsive-video demo-image">
                                    <span>Vidéo 16:9</span>
                                </div>
                                <h4 className="mt-2">Format Vidéo</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer de démonstration */}
            <section className="demo-footer section-responsive">
                <div className="container-responsive">
                    <div className="text-center">
                        <h3 className="text-responsive-lg">✅ Test Responsive Réussi!</h3>
                        <p className="text-responsive-base">
                            Votre site s'adapte parfaitement à tous les écrans
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResponsiveDemo;