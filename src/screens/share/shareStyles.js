import { StyleSheet } from 'react-native';
import { FontSize, Spacing } from '../../constants/theme';

export const TOTAL_SECONDS = 10 * 60;
export const SHARE_DOMAIN  = 'recover.no';

export const cardShadow = {
  shadowColor: '#000', shadowOpacity: 0.06,
  shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
};

export const smCard = {
  backgroundColor: '#fff', borderRadius: 16,
  padding: 16, marginBottom: 12, ...cardShadow,
};

export const styles = StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center' },
  headerBtn:  { width: 40 },
  headerBack: { color: '#fff', fontSize: 28, lineHeight: 34 },
  headerTitle:{ flex: 1, color: '#fff', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },

  tabBarWrapper: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: '#a0b8d0' },
  tabBar:        { flexDirection: 'row', paddingTop: 10 },
  tabBtn:        { flex: 1, alignItems: 'center', gap: 0 },
  tabLabel:      { fontSize: 11 },

  codeCard: {
    backgroundColor: '#fff', borderRadius: 24, paddingVertical: 32, paddingHorizontal: 36,
    alignItems: 'center', alignSelf: 'center', borderWidth: 1.5, borderColor: '#b3cde8',
    shadowColor: '#4A7AB5', shadowOpacity: 0.28, shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 }, elevation: 10, marginBottom: 20,
  },
  codeText:    { fontSize: 24, fontWeight: '800', letterSpacing: 4, marginBottom: 16 },
  brandRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText:   { fontSize: 15, color: '#333' },

  description: { fontSize: FontSize.sm, color: '#888', textAlign: 'center', marginBottom: 4, lineHeight: 20 },
  shareUrl:    { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center', marginBottom: 16 },

  toggleRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  toggleLabel: { fontSize: FontSize.md, fontWeight: '600' },

  timerCard: {
    backgroundColor: '#fff', borderRadius: 24, width: '100%',
    paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  timerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 12 },
  timerLabel:  { fontSize: FontSize.sm, fontWeight: '600' },
  divider:     { width: '100%', height: 1, backgroundColor: '#e8eef5', marginVertical: 16 },
  generateBtn: { paddingVertical: 4, marginTop: 8, marginBottom: 8 },
  generateText:{ fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1.5 },

  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', padding: 16,
    alignItems: 'center', alignSelf: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#e8eef5',
    shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
});
