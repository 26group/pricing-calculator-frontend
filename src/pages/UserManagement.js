import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useSelector } from 'react-redux';
import * as organisationApi from '../services/organisationApi';

const RoleChip = ({ role, isOwner }) => {
  if (isOwner) {
    return <Chip size="small" color="primary" label="Owner" />;
  }
  if (role === 'manager') {
    return <Chip size="small" color="secondary" label="Manager" />;
  }
  return <Chip size="small" variant="outlined" label="User" />;
};

export default function UserManagement() {
  const user = useSelector((state) => state.auth.user);
  const [organisation, setOrganisation] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const org = await organisationApi.getOrganisation();
      setOrganisation(org);
      setIsOwner(org?.isOwner || false);
      if (org) {
        const membersList = await organisationApi.getMembers(org.id);
        setMembers(membersList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviteLoading(true);
    setInviteError(null);
    try {
      const result = await organisationApi.inviteMember(organisation.id, inviteEmail);
      
      // In development, show the invite link
      if (result.inviteLink) {
        setSuccessMessage(`Invitation sent to ${inviteEmail}`);
      } else {
        setSuccessMessage(`Invitation sent to ${inviteEmail}`);
      }
      
      setInviteEmail('');
      setInviteDialogOpen(false);
      fetchData();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendInvite = async (email) => {
    setInviteLoading(true);
    setError(null);
    try {
      const result = await organisationApi.resendInvite(organisation.id, email);
      
      if (result.inviteLink) {
        setSuccessMessage(`Invitation resent to ${email}`);
      } else {
        setSuccessMessage(`Invitation resent to ${email}`);
      }
      
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemoveLoading(true);
    setError(null);
    try {
      await organisationApi.removeMember(organisation.id, memberToRemove.user?.id || memberToRemove.user?._id);
      setSuccessMessage('Member removed successfully');
      setMemberToRemove(null);
      setRemoveDialogOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRoleChange = async (member, newRole) => {
    try {
      await organisationApi.updateMemberRole(
        organisation.id,
        member.user?.id || member.user?._id,
        newRole
      );
      setSuccessMessage('Role updated successfully');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading users...</Typography>
        </Stack>
      </Container>
    );
  }

  if (!organisation) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">You are not part of any organisation.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#002060' }}>
            User Management
          </Typography>
          {isOwner && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteDialogOpen(true)}
            >
              Invite User
            </Button>
          )}
        </Stack>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  {isOwner && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow key={member.user?.id || member.user?._id || `pending-${index}`}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: member.status === 'pending' ? '#9e9e9e' : '#002060' }}>
                          {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        <Typography sx={{ color: member.status === 'pending' ? 'text.secondary' : 'text.primary' }}>
                          {member.user?.name || 'Unknown'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{member.user?.email || 'N/A'}</TableCell>
                    <TableCell>
                      {isOwner && !member.isOwner && member.status !== 'pending' ? (
                        <Select
                          value={member.orgRole || 'user'}
                          onChange={(e) => handleRoleChange(member, e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.8125rem', height: 32, minWidth: 100 }}
                        >
                          <MenuItem value="user" sx={{ fontSize: '0.8125rem' }}>User</MenuItem>
                          <MenuItem value="manager" sx={{ fontSize: '0.8125rem' }}>Manager</MenuItem>
                        </Select>
                      ) : (
                        <RoleChip role={member.orgRole} isOwner={member.isOwner} />
                      )}
                    </TableCell>
                    <TableCell>
                      {member.status === 'pending' ? (
                        <Chip label="Pending" size="small" color="warning" variant="outlined" />
                      ) : (
                        <Chip label="Active" size="small" color="success" variant="outlined" />
                      )}
                    </TableCell>
                    {isOwner && (
                      <TableCell align="right">
                        {member.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleResendInvite(member.user?.email)}
                            disabled={inviteLoading}
                            sx={{ mr: 1, fontSize: '0.75rem', py: 0.25, px: 1, minWidth: 'auto' }}
                          >
                            Resend
                          </Button>
                        )}
                        {!member.isOwner && (
                          <IconButton
                            color="error"
                            onClick={() => {
                              setMemberToRemove(member);
                              setRemoveDialogOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => { setInviteDialogOpen(false); setInviteEmail(''); setInviteError(null); }}>
          <DialogTitle>Invite User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
              <Typography variant="body2" color="text.secondary">
                Enter the email address of the user you want to invite to your organisation.
              </Typography>
              {inviteError && (
                <Alert severity="error" onClose={() => setInviteError(null)}>
                  {inviteError}
                </Alert>
              )}
              <TextField
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null); }}
                fullWidth
                autoFocus
                error={!!inviteError}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setInviteDialogOpen(false); setInviteEmail(''); setInviteError(null); }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleInviteMember}
              disabled={!inviteEmail.trim() || inviteLoading}
            >
              {inviteLoading ? <CircularProgress size={24} /> : 'Send Invite'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Dialog */}
        <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
          <DialogTitle>Remove User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove{' '}
              <strong>{memberToRemove?.user?.name || memberToRemove?.user?.email}</strong> from
              your organisation?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRemoveDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              onClick={handleRemoveMember}
              disabled={removeLoading}
            >
              {removeLoading ? <CircularProgress size={24} /> : 'Remove'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}
