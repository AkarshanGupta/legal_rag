import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileSearch, Wand2, FileText, AlertTriangle, List, Upload, Copy, CheckCircle, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ProcessingResult } from '@/components/ProcessingResult';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ChatInterface from '@/components/ChatInterface';
import { useApp } from '@/context/AppContext';
import {
  simplifyDocument,
  summarizeDocument,
  extractKeyTerms,
  analyzeRisks,
  getErrorMessage,
} from '@/services/api';

type ActionType = 'simplify' | 'summarize' | 'keyterms' | 'risk';

const actions = [
  {
    id: 'simplify' as ActionType,
    label: 'Simplify',
    icon: Wand2,
    description: 'Convert complex legal language into plain English',
  },
  {
    id: 'summarize' as ActionType,
    label: 'Summarize',
    icon: FileText,
    description: 'Get a concise summary of the document',
  },
  {
    id: 'keyterms' as ActionType,
    label: 'Key Terms',
    icon: List,
    description: 'Extract important terms and definitions',
  },
  {
    id: 'risk' as ActionType,
    label: 'Risk Analysis',
    icon: AlertTriangle,
    description: 'Identify potential risks and red flags',
  },
];

const ProcessPage: React.FC = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [documentId, setDocumentId] = useState('');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isNewDocumentMode, setIsNewDocumentMode] = useState(false);

  // Pre-fill document ID if passed from upload page
  useEffect(() => {
    const state = location.state as { documentId?: string } | null;
    if (state?.documentId) {
      setDocumentId(state.documentId);
      setIsNewDocumentMode(false);
    }
  }, [location.state]);

  const handleCopyDocId = async () => {
    if (documentId) {
      try {
        await navigator.clipboard.writeText(documentId);
        setCopied(true);
        showToast('success', 'Document ID copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        showToast('error', 'Failed to copy');
      }
    }
  };

  const handleUploadNew = () => {
    navigate('/upload');
  };

  const handleClearDocument = () => {
    setDocumentId('');
    setIsNewDocumentMode(true);
    setResult(null);
  };

  const handleProcess = async (actionType: ActionType) => {
    if (!documentId.trim()) {
      showToast('error', 'Please enter a document ID');
      return;
    }

    setIsLoading(true);
    setActiveAction(actionType);
    setResult(null);

    try {
      let response;
      let title = '';

      switch (actionType) {
        case 'simplify':
          response = await simplifyDocument(documentId, language);
          title = 'Simplified Document';
          break;
        case 'summarize':
          response = await summarizeDocument(documentId, language);
          title = 'Document Summary';
          break;
        case 'keyterms':
          response = await extractKeyTerms(documentId, language);
          title = 'Key Terms';
          break;
        case 'risk':
          response = await analyzeRisks(documentId, language);
          title = 'Risk Analysis';
          break;
      }

      setResult({ title, content: response.result });
      showToast('success', 'Document processed successfully');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Process Document</h1>
          <p className="text-muted-foreground">
            Enter your document ID and choose an analysis action.
          </p>
        </div>

        {/* Document ID Selection Card */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5" />
              Document Settings
            </CardTitle>
            <CardDescription>
              Configure your document processing options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="documentId" className="text-base font-semibold">
                Document ID
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Paste the ID of your ingested document or enter an existing document ID
              </p>
              <div className="flex gap-2">
                <Input
                  id="documentId"
                  placeholder="Enter or paste document ID..."
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="mt-1.5 font-mono"
                />
                {documentId && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyDocId}
                    className="mt-1.5"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              {documentId && (
                <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-success font-medium">
                    Document ID loaded and ready
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDocument}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUploadNew}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload New Document
              </Button>
            </div>

            <LanguageSelector value={language} onChange={setLanguage} />
          </CardContent>
        </Card>

        <Card className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Choose Action</CardTitle>
            <CardDescription>
              Select how you want to process your document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {actions.map((action) => {
                const Icon = action.icon;
                const isActive = activeAction === action.id;
                
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 gap-2 hover:border-primary/50"
                    onClick={() => handleProcess(action.id)}
                    disabled={isLoading || !documentId.trim()}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {isActive ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Icon className="w-5 h-5 text-primary" />
                      )}
                      <span className="font-semibold">{action.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      {action.description}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Processing Result */}
            <div className="h-96">
              <ProcessingResult title={result.title} result={result.content} />
            </div>
            
            {/* Chat Interface */}
            <div className="h-96">
              <ChatInterface documentId={documentId} language={language} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessPage;