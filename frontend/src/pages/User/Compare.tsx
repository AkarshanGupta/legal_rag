import React, { useState } from 'react';
import { GitCompare, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ProcessingResult } from '@/components/ProcessingResult';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { compareContracts, getErrorMessage } from '@/services/api';

const ComparePage: React.FC = () => {
  const { showToast } = useApp();
  const [documentId1, setDocumentId1] = useState('');
  const [documentId2, setDocumentId2] = useState('');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!documentId1.trim() || !documentId2.trim()) {
      showToast('error', 'Please enter both document IDs');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await compareContracts(documentId1, documentId2, language);
      setResult(response.result);
      showToast('success', 'Comparison completed successfully');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Contracts</h1>
          <p className="text-muted-foreground">
            Enter two document IDs to compare and identify differences.
          </p>
        </div>

        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Contract Comparison
            </CardTitle>
            <CardDescription>
              Compare two legal documents side by side.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doc1" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    1
                  </div>
                  First Document
                </Label>
                <div className="relative mt-2">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="doc1"
                    placeholder="Enter document ID..."
                    value={documentId1}
                    onChange={(e) => setDocumentId1(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="doc2" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    2
                  </div>
                  Second Document
                </Label>
                <div className="relative mt-2">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="doc2"
                    placeholder="Enter document ID..."
                    value={documentId2}
                    onChange={(e) => setDocumentId2(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <LanguageSelector value={language} onChange={setLanguage} />

            <Button
              onClick={handleCompare}
              disabled={!documentId1.trim() || !documentId2.trim() || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Comparing Documents...
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5 mr-2" />
                  Compare Contracts
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <ProcessingResult title="Comparison Results" result={result} />
        )}
      </div>
    </div>
  );
};

export default ComparePage;
