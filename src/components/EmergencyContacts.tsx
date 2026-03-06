import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['trusted_contacts']['Row'];

export function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error loading contacts:', error);
      return;
    }

    setContacts(data || []);
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('trusted_contacts').insert({
      user_id: user.id,
      name: formData.name,
      phone_number: formData.phone_number,
      email: formData.email,
      priority: contacts.length + 1,
    });

    if (error) {
      console.error('Error adding contact:', error);
      return;
    }

    setFormData({ name: '', phone_number: '', email: '' });
    setShowForm(false);
    loadContacts();
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      return;
    }

    loadContacts();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {showForm && (
        <form onSubmit={addContact} className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No emergency contacts added yet</p>
            <p className="text-sm">Add contacts who will be alerted in case of emergency</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {contact.phone_number}
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteContact(contact.id)}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
