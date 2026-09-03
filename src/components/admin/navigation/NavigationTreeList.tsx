import React, { useState } from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Globe,
  CornerDownRight,
  CheckCircle2,
  XCircle,
  Home,
  Tag,
  FileText,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { NavigationItem, NavigationItemWithChildren } from '../../../types/navigation';

interface NavigationTreeListProps {
  tree: NavigationItemWithChildren[];
  onToggleActive: (id: string) => void;
  onEditItem: (item: NavigationItem) => void;
  onDeleteItem: (item: NavigationItem) => void;
  onAddSubmenu: (parentId: string) => void;
  onMoveOrder: (id: string, direction: 'up' | 'down') => void;
  onMoveToParent: (childId: string, newParentId: string | null) => void;
  onReorderParents?: (orderedIds: string[]) => void;
}

export const NavigationTreeList: React.FC<NavigationTreeListProps> = ({
  tree,
  onToggleActive,
  onEditItem,
  onDeleteItem,
  onAddSubmenu,
  onMoveOrder,
  onMoveToParent,
}) => {
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const toggleCollapse = (parentId: string) => {
    setCollapsedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const getTargetBadge = (item: NavigationItem) => {
    if (item.type === 'external') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
          <ExternalLink className="w-3 h-3" />
          <span>Eksternal</span>
        </span>
      );
    }

    if (item.targetType === 'kategori') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          <Tag className="w-3 h-3" />
          <span>Kategori</span>
        </span>
      );
    }

    if (item.targetType === 'page') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FileText className="w-3 h-3" />
          <span>Page</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        <LinkIcon className="w-3 h-3" />
        <span>Route</span>
      </span>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">Belum Ada Item Navigasi</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Klik tombol &quot;Tambah Menu&quot; untuk menambahkan menu utama atau submenu ke bar navigasi SO2.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" id="navigation-tree-container">
      {tree.map((parent, parentIndex) => {
        const hasChildren = Boolean(parent.children && parent.children.length > 0);
        const isCollapsed = Boolean(collapsedParents[parent.id]);
        const isFirstParent = parentIndex === 0;
        const isLastParent = parentIndex === tree.length - 1;

        return (
          <div
            key={parent.id}
            id={`nav-item-card-${parent.id}`}
            className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
              parent.active
                ? 'border-slate-200 hover:border-red-300'
                : 'border-slate-200 bg-slate-50/70 opacity-75'
            }`}
          >
            {/* ========================================================= */}
            {/* LEVEL 1: PARENT ROW                                       */}
            {/* ========================================================= */}
            <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Drag Handle Icon (☰) */}
                <div
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition shrink-0"
                  title="Drag Handle Menu"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Up/Down Quick Order Buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMoveOrder(parent.id, 'up')}
                    disabled={isFirstParent}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 hover:bg-slate-100 rounded transition"
                    title="Pindahkan ke Atas"
                    aria-label="Pindahkan ke Atas"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveOrder(parent.id, 'down')}
                    disabled={isLastParent}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 hover:bg-slate-100 rounded transition"
                    title="Pindahkan ke Bawah"
                    aria-label="Pindahkan ke Bawah"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Expand / Collapse Button if has children */}
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleCollapse(parent.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                    title={isCollapsed ? 'Buka Submenu' : 'Tutup Submenu'}
                    aria-label={isCollapsed ? 'Buka Submenu' : 'Tutup Submenu'}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90 text-slate-400' : 'text-red-600'
                      }`}
                    />
                  </button>
                ) : (
                  <div className="w-7 shrink-0" />
                )}

                {/* Label & Target Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {parent.slug === 'home' && (
                      <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wide truncate">
                      {parent.label}
                    </span>

                    {/* Level 1 Badge */}
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      Level 1
                    </span>

                    {/* Target Type Badge */}
                    {getTargetBadge(parent)}

                    {/* Submenu count badge */}
                    {hasChildren && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                        {parent.children!.length} Submenu
                      </span>
                    )}
                  </div>

                  {/* URL path preview */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      {parent.url}
                    </span>
                    {parent.openNewTab && (
                      <span className="text-[10px] text-purple-600 font-semibold">(Tab Baru)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions & Status Controls */}
              <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Active / Inactive Switch */}
                <button
                  type="button"
                  onClick={() => onToggleActive(parent.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                    parent.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                  title={parent.active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                >
                  {parent.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nonaktif</span>
                    </>
                  )}
                </button>

                {/* Shortcut Add Submenu */}
                <button
                  type="button"
                  onClick={() => onAddSubmenu(parent.id)}
                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200 hover:border-red-200"
                  title={`Tambah Submenu ke ${parent.label}`}
                  aria-label={`Tambah Submenu ke ${parent.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => onEditItem(parent)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-slate-200 hover:border-blue-200"
                  title="Edit Menu"
                  aria-label="Edit Menu"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeleteItem(parent)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200 hover:border-red-200"
                  title="Hapus Menu"
                  aria-label="Hapus Menu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* LEVEL 2: SUBMENU ROWS (Accordion Tree)                    */}
            {/* ========================================================= */}
            {hasChildren && !isCollapsed && (
              <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-6 mb-1 flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-red-500" />
                  <span>Submenu Turunan (Level 2) — {parent.label}</span>
                </div>

                <div className="space-y-1.5 pl-4 sm:pl-6 border-l-2 border-red-200 ml-3 sm:ml-4">
                  {parent.children!.map((child, childIndex) => {
                    const isFirstChild = childIndex === 0;
                    const isLastChild = childIndex === parent.children!.length - 1;

                    return (
                      <div
                        key={child.id}
                        id={`nav-child-row-${child.id}`}
                        className={`bg-white rounded-xl border p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition shadow-2xs ${
                          child.active
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-200 bg-slate-100/60 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Drag Handle Icon (☰) */}
                          <div
                            className="p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 transition shrink-0"
                            title="Drag Handle Submenu"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          {/* Up/Down Order */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onMoveOrder(child.id, 'up')}
                              disabled={isFirstChild}
                              className="p-0.5 text-slate-400 hover:text-red-600 disabled:opacity-20 hover:bg-slate-100 rounded transition"
                              title="Pindahkan Submenu ke Atas"
                            >
                              <ArrowUp className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onMoveOrder(child.id, 'down')}
                              disabled={isLastChild}
                              className="p-0.5 text-slate-400 hover:text-red-600 disabled:opacity-20 hover:bg-slate-100 rounded transition"
                              title="Pindahkan Submenu ke Bawah"
                            >
                              <ArrowDown className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Connector Marker */}
                          <span className="text-slate-300 text-xs font-mono shrink-0">
                            {isLastChild ? '└──' : '├──'}
                          </span>

                          {/* Label & Target Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-800 uppercase tracking-wide truncate">
                                {child.label}
                              </span>

                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                Level 2
                              </span>

                              {getTargetBadge(child)}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-400 truncate">
                                {child.url}
                              </span>
                              {child.openNewTab && (
                                <span className="text-[9px] text-purple-600 font-semibold">(Tab Baru)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions for Child */}
                        <div className="flex items-center justify-between md:justify-end gap-1.5 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {/* Move to another Parent selector */}
                          <select
                            value={child.parentId || ''}
                            onChange={(e) => onMoveToParent(child.id, e.target.value || null)}
                            className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                            title="Pindahkan Submenu ke Parent Lain"
                          >
                            {tree.map((p) => (
                              <option key={p.id} value={p.id}>
                                Parent: {p.label}
                              </option>
                            ))}
                            <option value="">Jadikan Root (Level 1)</option>
                          </select>

                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => onToggleActive(child.id)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                              child.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={child.active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                          >
                            {child.active ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{child.active ? 'Aktif' : 'Nonaktif'}</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => onEditItem(child)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-slate-200 hover:border-blue-200"
                            title="Edit Submenu"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => onDeleteItem(child)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-slate-200 hover:border-red-200"
                            title="Hapus Submenu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
