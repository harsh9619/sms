import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { fetchNotices, createNotice, updateNotice, deleteNotice } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Megaphone, Pin, Plus, Trash2, Edit, X, Calendar, User, Eye } from "lucide-react";
import type { NoticeRecord } from "../../types";

export function NoticesPage() {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeRecord | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    audience: "all" as "all" | "teacher" | "student",
    isPinned: false,
  });
  const [error, setError] = useState<string | null>(null);

  const loadNotices = React.useCallback(() => {
    setLoading(true);
    // Determine audience target
    let audience: string | undefined = undefined;
    if (user?.role === "student") {
      audience = "student";
    } else if (user?.role === "teacher") {
      audience = "teacher";
    }

    fetchNotices(audience)
      .then((data) => {
        setNotices(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user, activeSchool]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const openAddModal = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      content: "",
      audience: "all",
      isPinned: false,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (notice: NoticeRecord) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      audience: notice.audience,
      isPinned: notice.isPinned,
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    deleteNotice(id)
      .then(() => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      })
      .catch(() => alert("Failed to delete notice"));
  };

  const handleSave = () => {
    setError(null);
    if (!formData.title || !formData.content) {
      setError("Please fill in notice title and content.");
      return;
    }

    const payload = {
      ...formData,
      createdBy: user?.id || null,
    };

    if (editingNotice) {
      updateNotice(editingNotice.id, payload)
        .then(() => {
          setShowModal(false);
          loadNotices();
        })
        .catch(() => setError("Failed to update notice."));
    } else {
      createNotice(payload)
        .then(() => {
          setShowModal(false);
          loadNotices();
        })
        .catch(() => setError("Failed to publish notice."));
    }
  };

  const audienceBadge = (audience: string) => {
    if (audience === "all") return <Badge variant="secondary">All Roles</Badge>;
    if (audience === "teacher") return <Badge variant="info">Teachers Only</Badge>;
    return <Badge variant="warning">Students Only</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-primary animate-pulse-glow" />
            Notice Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Important announcements, events, and updates from the administration
          </p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Post Notice
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Eye className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice) => (
            <Card
              key={notice.id}
              className={`hover-lift relative text-left border flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                notice.isPinned
                  ? "border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card shadow-md shadow-primary/5"
                  : "border-border/80"
              }`}
            >
              {notice.isPinned && (
                <div className="absolute top-0 right-0 p-1 bg-primary text-white rounded-bl-lg flex items-center justify-center" title="Pinned Announcement">
                  <Pin className="h-3.5 w-3.5 fill-white" />
                </div>
              )}
              <CardHeader className="pb-3 pr-8">
                <div className="flex items-center gap-2 mb-2.5">
                  {audienceBadge(notice.audience)}
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(notice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <CardTitle className="text-base font-bold leading-snug pr-4">
                  {notice.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                    <User className="h-3.5 w-3.5 text-primary/75" />
                    <span>{notice.creatorName || "Administration"}</span>
                  </div>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(notice)} className="h-7 px-2 text-primary hover:bg-primary/10 text-[10px]">
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(notice.id)} className="h-7 px-2 text-destructive hover:bg-destructive/10 text-[10px]">
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {notices.length === 0 && (
            <div className="col-span-full text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border/70">
              <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No notices published yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Check back later for school updates.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingNotice ? "Edit Notice" : "Create Notice Announcement"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {error && <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">{error}</div>}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Title</label>
                <Input
                  placeholder="e.g. Science Fair Registration Open"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notice Content</label>
                <textarea
                  placeholder="Type the announcement details here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-[140px] p-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none resize-y"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Target Audience</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="student">Students & Parents Only</option>
                </select>
              </div>

              {/* Pin notice */}
              <div className="flex items-center gap-3.5 py-1 pt-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="h-4 w-4 text-primary border-input rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isPinned" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                  Pin this notice to the top of the board
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>Publish Notice</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
