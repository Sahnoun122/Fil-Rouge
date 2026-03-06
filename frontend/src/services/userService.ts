import { api } from '../utils/fetcher';

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getProfile() {
    const res: any = await api.get('/users/profile');
    if (!res.success) throw new Error(res.message || 'Erreur lors de la recuperation du profil');
    return res.data;
  },

  async updateProfile(data: UpdateProfileData) {
    const res: any = await api.put('/users/profile', data);
    if (!res.success) throw new Error(res.message || 'Erreur lors de la mise a jour du profil');
    return res.data;
  },

  async changePassword(data: ChangePasswordData) {
    const res: any = await api.put('/users/password', data);
    if (!res.success) throw new Error(res.message || 'Erreur lors du changement de mot de passe');
    return res;
  },

  async deleteOwnAccount() {
    const res: any = await api.delete('/users/profile');
    if (!res.success) throw new Error(res.message || 'Erreur lors de la suppression du compte');
    return res;
  },
};
