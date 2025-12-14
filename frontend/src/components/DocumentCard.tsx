import React from 'react';
import { FileText, Copy, Trash2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StoredDocument } from '@/utils/storage';
import { useApp } from '@/context/AppContext';

interface DocumentCardProps {
  document: StoredDocument;
  onProcess?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onProcess,
  onDelete,
  className,
}) => {
  const { showToast } = useApp();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(document.id);
      showToast('success', 'Document ID copied to clipboard');
    } catch {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn("group hover:shadow-elegant transition-all duration-300", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {document.name || 'Untitled Document'}
              </p>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                {document.type}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {document.id}
            </p>
            
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(document.uploadedAt)}
            </p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-8 w-8"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            {onProcess && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onProcess(document.id)}
                className="h-8 w-8 text-primary"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(document.id)}
                className="h-8 w-8 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
