import { Copy, LockKeyhole, Mail, UserPlus, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import type { WorkspaceData } from '../../api/workspaceTypes';
import { EmptyState } from '../../components/EmptyState';
import { ReadOnlyNotice } from '../../components/ReadOnlyNotice';
import type { Translate } from '../../i18n';

export function TeamView({
  canManage,
  data,
  onCancelInvitation,
  onInvite,
  t,
}: {
  canManage: boolean;
  data: WorkspaceData;
  onCancelInvitation: (invitationId: string) => Promise<void>;
  onInvite: (input: { email: string; role: string }) => Promise<boolean>;
  t: Translate;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const pendingInvitations = data.invitations ?? [];

  async function copyInvitationLink(previewUrl: string) {
    await navigator.clipboard.writeText(previewUrl);
  }

  async function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }
    if (await onInvite({ email, role })) {
      setEmail('');
      setRole('Member');
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
      <div className="surface-panel rounded-ui p-5">
        <h2 className="text-2xl font-bold tracking-normal">{t('teamPermissions')}</h2>
        <div className="mt-5 grid gap-3">
          {data.users.length ? (
            data.users.map((user) => (
              <div
                key={user.email}
                className="flex flex-wrap items-center justify-between gap-3 quiet-panel rounded-ui p-4"
              >
                <div>
                  <p className="font-bold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal">
                    {user.role}
                  </span>
                  <LockKeyhole size={18} className="text-slate-400" aria-hidden="true" />
                </div>
              </div>
            ))
          ) : (
            <EmptyState title={t('noTeamTitle')} body={t('noTeamBody')} />
          )}
        </div>
      </div>

      <div className="grid gap-5">
        {canManage ? (
          <form className="surface-panel rounded-ui p-5" onSubmit={submitInvitation}>
            <UserPlus className="text-teal" size={24} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold tracking-normal">{t('inviteTeamMember')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t('inviteTeamMemberBody')}</p>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">{t('email')}</span>
              <span className="field-frame mt-2 flex h-11 items-center gap-2 rounded-ui px-3">
                <Mail size={17} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="new.member@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">{t('role')}</span>
              <select
                className="field-frame mt-2 h-11 w-full rounded-ui px-3 text-sm outline-none"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {['Administrator', 'Manager', 'Member', 'Viewer'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="primary-action mt-5 inline-flex h-10 items-center gap-2 rounded-ui px-4 text-sm font-semibold text-white"
              type="submit"
            >
              <UserPlus size={16} aria-hidden="true" />
              {t('sendInvite')}
            </button>
          </form>
        ) : (
          <ReadOnlyNotice t={t} />
        )}

        <div className="surface-panel rounded-ui p-5">
          <h2 className="text-lg font-bold tracking-normal">{t('pendingInvitations')}</h2>
          <div className="mt-4 grid gap-3">
            {pendingInvitations.length ? (
              pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="quiet-panel flex items-center justify-between gap-3 rounded-ui p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{invitation.email}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {invitation.role} · {t('expires')}{' '}
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.previewUrl ? (
                      <button
                        className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                        type="button"
                        title={t('copyInvitationLink')}
                        aria-label={t('copyInvitationLink')}
                        onClick={() => copyInvitationLink(invitation.previewUrl!)}
                      >
                        <Copy size={16} aria-hidden="true" />
                      </button>
                    ) : null}
                    {canManage ? (
                      <button
                        className="secondary-action inline-flex h-9 w-9 items-center justify-center rounded-ui"
                        type="button"
                        aria-label={t('cancelInvitation')}
                        onClick={() => onCancelInvitation(invitation.id)}
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title={t('noInvitationsTitle')} body={t('noInvitationsBody')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
