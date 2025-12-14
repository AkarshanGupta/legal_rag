import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Upload, FileSearch, GitCompare, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Upload,
    title: 'Upload Documents',
    description: 'Securely upload your legal documents in PDF or text format.',
    link: '/upload',
  },
  {
    icon: FileSearch,
    title: 'Process & Analyze',
    description: 'Simplify, summarize, and extract key terms from complex legal text.',
    link: '/process',
  },
  {
    icon: GitCompare,
    title: 'Compare Contracts',
    description: 'Side-by-side comparison of two contracts to identify differences.',
    link: '/compare',
  },
];

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Legal Document Analysis
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Simplify Complex
              <span className="block text-primary">Legal Documents</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              LegalEase uses advanced AI to analyze, simplify, and compare legal documents. 
              Get clear insights into contracts, agreements, and legal text in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/upload">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Upload className="w-5 h-5" />
                  Upload Document
                </Button>
              </Link>
              <Link to="/process">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <FileSearch className="w-5 h-5" />
                  Process Document
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powerful Legal Analysis Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand and process legal documents efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-elegant hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link to={feature.link}>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="relative p-8 lg:p-12">
              <div className="absolute inset-0 gradient-primary opacity-5" />
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl gradient-primary shadow-glow">
                    <Shield className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Admin Access
                    </h3>
                    <p className="text-muted-foreground">
                      Manage documents and ingestion as an administrator.
                    </p>
                  </div>
                </div>
                <Link to="/admin">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Panel
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
