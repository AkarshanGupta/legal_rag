import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/DocumentCard';
import { useApp } from '@/context/AppContext';

const DocumentsPage: React.FC = () => {
  const { userDocuments, removeDocument, showToast } = useApp();
  const navigate = useNavigate();

  const handleProcess = (documentId: string) => {
    navigate(`/process?doc=${documentId}`);
  };

  const handleDelete = (documentId: string) => {
    removeDocument(documentId);
    showToast('success', 'Document removed from your list');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Documents</h1>
          <p className="text-muted-foreground">
            View and manage your uploaded documents.
          </p>
        </div>

        {userDocuments.length === 0 ? (
          <Card className="animate-slide-up">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Documents Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  You haven't uploaded any documents yet. Start by uploading a document to analyze.
                </p>
                <Button onClick={() => navigate('/upload')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="animate-slide-up">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>
                      {userDocuments.length} document{userDocuments.length !== 1 ? 's' : ''} stored locally
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-3">
              {userDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <DocumentCard
                    document={doc}
                    onProcess={handleProcess}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
