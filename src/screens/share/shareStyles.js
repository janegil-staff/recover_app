import { StyleSheet } from 'react-native';
import { FontSize, Spacing } from '../../constants/theme';

export const TOTAL_SECONDS = 10 * 60;
export const SHARE_DOMAIN  = 'https://recover-online.com';

export const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn:   { width: 40 },
  headerBack:  { color: '#fff', fontSize: 28, lineHeight: 34 },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Tab bar
  tabBarWrapper: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: theme.border,
  },
  tabBar:   { flexDirection: 'row', paddingTop: 6 },
  tabBtn:   { flex: 1, alignItems: 'center', gap: 0 },
  tabLabel: { fontSize: 11 },

  // Code card
  codeCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: theme.accentBorder ?? theme.border,
    shadowColor: theme.accent,
    shadowOpacity: theme.mode === 'dark' ? 0.4 : 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 10,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 10,
  },
  brandRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: 13, color: theme.textSecondary ?? theme.text },

  // Info card
  infoCard: {
    backgroundColor: theme.card,
    borderRadius: 14,
    width: '100%',
    padding: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  description: {
    fontSize: FontSize.sm,
    color: theme.textSecondary ?? theme.textMuted,
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 18,
  },
  shareUrl: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  toggleLabel: { fontSize: FontSize.sm, fontWeight: '600' },

  // Timer card
  timerCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  timerLabel:   { fontSize: FontSize.sm, fontWeight: '600' },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 14,
  },
  generateBtn:  { paddingVertical: 2, marginTop: 4, marginBottom: 4 },
  generateText: { fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1.5 },
});

// Backwards-compat: anyone still importing { styles } gets a light-theme fallback.
// But ShareScreen.js should use makeStyles(theme) instead.
export const styles = makeStyles({
  mode: 'light',
  surface: '#fff',
  card: '#fff',
  border: '#e8eef5',
  accent: '#4A7AB5',
  accentBorder: '#b3cde8',
  text: '#1a2c3d',
  textSecondary: '#888',
  textMuted: '#7a9ab8',
});