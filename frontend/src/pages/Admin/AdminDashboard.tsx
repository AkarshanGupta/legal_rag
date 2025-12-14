import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, Type, LogOut, CheckCircle, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { adminIngestFile, adminIngestText, getErrorMessage } from '@/services/api';

const AdminDashboard: React.FC = () => {
  const { adminToken, logoutAdmin, showToast } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    showToast('info', 'Logged out successfully');
    navigate('/admin');
  };

  const handleFileIngest = async () => {
    if (!selectedFile || !adminToken) {
      showToast('error', 'Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminIngestFile(adminToken, selectedFile);
      setUploadedDocId(response.document_id);
      showToast('success', response.message);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextIngest = async () => {
    if (!textInput.trim() || !adminToken) {
      showToast('error', 'Please enter some text');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminIngestText(adminToken, textInput);
      setUploadedDocId(response.document_id);
      showToast('success', response.message);
      setTextInput('');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (uploadedDocId) {
      try {
        await navigator.clipboard.writeText(uploadedDocId);
        setCopied(true);
        showToast('success', 'Document ID copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        showToast('error', 'Failed to copy');
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg gradient-primary shadow-card">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">Admin Dashboard</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Data Ingestion</h1>
            <p className="text-muted-foreground">
              Upload documents to the knowledge base for RAG processing.
            </p>
          </div>

          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Ingest Document
              </CardTitle>
              <CardDescription>
                Add new documents to the system for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="file" className="gap-2">
                    <FileText className="w-4 h-4" />
                    File Upload
                  </TabsTrigger>
                  <TabsTrigger value="text" className="gap-2">
                    <Type className="w-4 h-4" />
                    Text Input
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleFileIngest}
                    disabled={!selectedFile || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Ingest File'
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Paste document text to ingest..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[200px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleTextIngest}
                    disabled={!textInput.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Ingest Text'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Success Result */}
          {uploadedDocId && (
            <Card className="mt-6 border-success/20 bg-success/5 animate-scale-in">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-success/10">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Document Ingested Successfully!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      The document has been added to the knowledge base.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="flex-1 text-sm font-mono text-foreground truncate">
                        {uploadedDocId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="shrink-0"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
