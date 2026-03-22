// src/components/TrustedContacts.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Phone, Mail, ShieldCheck, Plus, Trash2, Edit, Save, X, Copy, AlertTriangle, Loader2 } from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  priority?: number;
  user_id: string;
};

export function TrustedContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    email: '',
    priority: contacts.length + 1,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});
  const { user } = useAuth();

  // Load contacts + real-time subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('Please log in to manage trusted contacts');
      return;
    }

    const loadContacts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('trusted_contacts')
          .select('id, name, phone_number, email, priority, user_id')
          .eq('user_id', user.id)
          .order('priority', { ascending: true });

        if (error) throw error;
        setContacts(data || []);
      } catch (err: any) {
        console.error('Error loading contacts:', err);
        setError(err.message || 'Failed to load trusted contacts');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();

    // Real-time subscription
    const channel = supabase
      .channel('trusted_contacts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trusted_contacts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setContacts((prev) => [...prev, payload.new as Contact].sort((a, b) => (a.priority || 0) - (b.priority || 0)));
          } else if (payload.eventType === 'UPDATE') {
            setContacts((prev) =>
              prev.map((c) => (c.id === payload.new.id ? { ...c, ...(payload.new as Contact) } : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setContacts((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Add new contact
  const addContact = async () => {
    if (!user || !newContact.name || !newContact.phone_number) {
      alert('Name and phone number are required');
      return;
    }

    try {
      const { error } = await supabase.from('trusted_contacts').insert({
        user_id: user.id,
        name: newContact.name.trim(),
        phone_number: newContact.phone_number.trim(),
        email: newContact.email?.trim() || null,
        priority: newContact.priority,
      });

      if (error) throw error;

      setNewContact({ name: '', phone_number: '', email: '', priority: contacts.length + 1 });
      alert('Contact added successfully!');
    } catch (err: any) {
      console.error('Add contact failed:', err);
      alert('Failed to add contact: ' + (err.message || 'Unknown error'));
    }
  };

  // Delete contact
  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to remove this trusted contact?')) return;

    try {
      const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);

      if (error) throw error;
      alert('Contact removed');
    } catch (err: any) {
      alert('Failed to delete contact: ' + err.message);
    }
  };

  // Start editing
  const startEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditForm({ ...contact });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingId || !editForm.name || !editForm.phone_number) {
      alert('Name and phone are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .update({
          name: editForm.name.trim(),
          phone_number: editForm.phone_number.trim(),
          email: editForm.email?.trim() || null,
          priority: editForm.priority,
        })
        .eq('id', editingId);

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      alert('Contact updated');
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Simulate send alert with current location if available
  const simulateSendAlert = () => {
    if (contacts.length === 0) {
      alert('No trusted contacts added yet.');
      return;
    }

    const locText = location
      ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      : '(location not available yet)';

    const message = `🚨 EMERGENCY ALERT from AI Guardian
User needs immediate help!
Location: ${locText}
Time: ${new Date().toLocaleString('en-IN')}`;

    alert(
      `Simulated alert sent to ${contacts.length} contact(s):\n\n${message}\n\n(In real version this would be sent via SMS)`
    );
  };

  // Copy phone number
  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    alert('Phone number copied!');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-lg mx-auto mt-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-rose-600" size={32} />
          <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading contacts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-lg mx-auto mt-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-5 py-6 rounded-xl text-center">
          <AlertTriangle className="mx-auto mb-4" size={32} />
          <p className="font-medium text-lg">Error loading contacts</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 sm:p-7 w-full max-w-4xl mx-auto mt-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-rose-600" size={28} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Trusted Emergency Contacts
          </h2>
        </div>

        <button
          onClick={simulateSendAlert}
          disabled={contacts.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Phone size={18} />
          Simulate Alert
        </button>
      </div>

      {/* Add new contact form */}
      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Plus size={20} />
          Add New Trusted Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={newContact.phone_number}
              onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="contact@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addContact}
              disabled={!newContact.name || !newContact.phone_number}
              className="w-full px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Phone className="mx-auto mb-4 opacity-70" size={48} />
          <p className="text-lg font-medium">No trusted contacts added yet</p>
          <p className="text-sm mt-2">
            Add emergency contacts above so they can be notified during an alert
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => {
            const isEditing = editingId === contact.id;

            return (
              <div
                key={contact.id}
                className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-600 transition-all"
              >
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone_number || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-end gap-3">
                      <button
                        onClick={saveEdit}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-lg">
                        {contact.name}
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{contact.phone_number}</span>
                          <button
                            onClick={() => copyPhone(contact.phone_number)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Copy phone number"
                          >
                            <Copy size={14} />
                          </button>
                        </div>

                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEdit(contact)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Edit contact"
                      >
                        <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>

                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper to copy phone
function copyPhone(phone: string) {
  navigator.clipboard.writeText(phone).then(() => {
    alert('Phone number copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy phone number');
  });
}