import React, { useState } from "react";
import { useMyLinks } from "@/hooks/useMyLinks";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LinksManager() {
  const { theme } = useTheme();
  const { links, isLoading, error, createLink, updateLink, deleteLink, isCreating, isUpdating, isDeleting } = useMyLinks();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', visible: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', url: '' });

  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    
    try {
      await createLink(newLink);
      setNewLink({ title: '', url: '', visible: true });
      setIsAdding(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStartEdit = (link: any) => {
    setEditingId(link.id);
    setEditForm({ title: link.title, url: link.url });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateLink({ id, updates: editForm });
      setEditingId(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', url: '' });
  };

  const handleToggleVisible = async (id: string, currentVisible: boolean) => {
    try {
      await updateLink({ id, updates: { visible: !currentVisible } });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await deleteLink(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const link = links[index];
    const prevLink = links[index - 1];
    
    try {
      await updateLink({ id: link.id, updates: { position: prevLink.position } });
      await updateLink({ id: prevLink.id, updates: { position: link.position } });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === links.length - 1) return;
    
    const link = links[index];
    const nextLink = links[index + 1];
    
    try {
      await updateLink({ id: link.id, updates: { position: nextLink.position } });
      await updateLink({ id: nextLink.id, updates: { position: link.position } });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className={cn(
            "w-8 h-8 animate-spin",
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'
          )} />
        </div>
      </ThemedCard>
    );
  }

  // Error state
  if (error) {
    return (
      <ThemedCard className="p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load links</span>
        </div>
      </ThemedCard>
    );
  }

  return (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(
          'font-bold text-lg',
          theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
        )}>
          Links Management
        </h3>
        {!isAdding && (
          <ThemedButton size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Link
          </ThemedButton>
        )}
      </div>

      {/* Add new link form */}
      {isAdding && (
        <div className={cn(
          "p-4 rounded-lg mb-4 space-y-3",
          theme === 'cyberpunk'
            ? 'bg-slate-900/60 border border-cyan-400/20'
            : 'bg-slate-50 border border-slate-200'
        )}>
          <div>
            <Label className="text-xs mb-1 block">Title</Label>
            <Input
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              placeholder="My Portfolio"
              className="mb-2"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">URL</Label>
            <Input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://example.com"
              className="mb-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={newLink.visible}
              onCheckedChange={(checked) => setNewLink({ ...newLink, visible: checked })}
            />
            <Label className="text-xs">Visible on public profile</Label>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddLink}
              disabled={isCreating || !newLink.title.trim() || !newLink.url.trim()}
              size="sm"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Save
            </Button>
            <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <div className={cn(
          "text-center py-8 text-sm opacity-70",
          theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
        )}>
          No links yet. Click "Add Link" to create your first link.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={cn(
                "p-4 rounded-lg transition-all",
                theme === 'cyberpunk'
                  ? 'bg-slate-900/60 border border-cyan-400/20'
                  : 'bg-slate-50 border border-slate-200'
              )}
            >
              {editingId === link.id ? (
                // Edit mode
                <div className="space-y-3">
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title"
                  />
                  <Input
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    placeholder="URL"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleSaveEdit(link.id)} size="sm" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{link.title}</h4>
                      {link.visible ? (
                        <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "text-xs opacity-70 hover:opacity-100 flex items-center gap-1 truncate",
                        theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                      )}
                    >
                      {link.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <div className="text-xs opacity-60 mt-1">
                      {link.clicks} clicks
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Position controls */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || isUpdating}
                        className={cn(
                          "p-1 rounded transition-all",
                          index === 0 
                            ? 'opacity-30 cursor-not-allowed'
                            : theme === 'cyberpunk'
                              ? 'hover:bg-cyan-400/20 text-cyan-400'
                              : 'hover:bg-blue-100 text-blue-600'
                        )}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === links.length - 1 || isUpdating}
                        className={cn(
                          "p-1 rounded transition-all",
                          index === links.length - 1
                            ? 'opacity-30 cursor-not-allowed'
                            : theme === 'cyberpunk'
                              ? 'hover:bg-cyan-400/20 text-cyan-400'
                              : 'hover:bg-blue-100 text-blue-600'
                        )}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toggle visibility */}
                    <button
                      onClick={() => handleToggleVisible(link.id, link.visible)}
                      disabled={isUpdating}
                      className={cn(
                        "p-2 rounded transition-all",
                        theme === 'cyberpunk'
                          ? 'hover:bg-cyan-400/20 text-cyan-400'
                          : 'hover:bg-blue-100 text-blue-600'
                      )}
                    >
                      {link.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleStartEdit(link)}
                      disabled={isUpdating}
                      className={cn(
                        "p-2 rounded transition-all",
                        theme === 'cyberpunk'
                          ? 'hover:bg-cyan-400/20 text-cyan-400'
                          : 'hover:bg-blue-100 text-blue-600'
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(link.id)}
                      disabled={isDeleting}
                      className={cn(
                        "p-2 rounded transition-all",
                        theme === 'cyberpunk'
                          ? 'hover:bg-red-400/20 text-red-400'
                          : 'hover:bg-red-100 text-red-600'
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ThemedCard>
  );
}

