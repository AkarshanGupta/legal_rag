import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Type, Copy, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { userUploadFile, userUploadText, getErrorMessage } from '@/services/api';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, addDocument } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showToast('error', 'Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userUploadFile(selectedFile);
      setUploadedDocId(response.document_id);
      addDocument({
        id: response.document_id,
        uploadedAt: new Date().toISOString(),
        type: 'file',
        name: selectedFile.name,
      });
      showToast('success', response.message);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      showToast('error', 'Please enter some text');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userUploadText(textInput);
      setUploadedDocId(response.document_id);
      addDocument({
        id: response.document_id,
        uploadedAt: new Date().toISOString(),
        type: 'text',
        name: `Text Document (${textInput.slice(0, 30)}...)`,
      });
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload a legal document or paste text to get started with analysis.
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Choose Upload Method</CardTitle>
            <CardDescription>
              Upload a PDF/text file or paste your document content directly.
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
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Upload File'
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Paste your legal document text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[200px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleTextUpload}
                  disabled={!textInput.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Upload Text'
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
                    Document Uploaded Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your document ID has been generated. Use this ID to process your document.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-3">
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
                  <Button
                    onClick={() => navigate('/process', { state: { documentId: uploadedDocId } })}
                    className="w-full gap-2"
                  >
                    Process Document
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPage;