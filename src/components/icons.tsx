import { StyleSheet, View } from 'react-native';

export function MenuIcon({ color }: { color: string }) {
  return (
    <View style={styles.menu}>
      <View style={[styles.menuBar, { backgroundColor: color }]} />
      <View style={[styles.menuBar, { backgroundColor: color }]} />
      <View style={[styles.menuBar, { backgroundColor: color }]} />
    </View>
  );
}

export function SearchIcon({ color }: { color: string }) {
  return (
    <View style={styles.search}>
      <View style={[styles.searchGlass, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

export function ChevronIcon({
  color,
  direction = 'right',
}: {
  color: string;
  direction?: 'right' | 'down' | 'left';
}) {
  const rotate = direction === 'right' ? '45deg' : direction === 'down' ? '135deg' : '-135deg';
  return (
    <View style={styles.chevronBox}>
      <View style={[styles.chevron, { borderColor: color, transform: [{ rotate }] }]} />
    </View>
  );
}

export function CloseIcon({ color }: { color: string }) {
  return (
    <View style={styles.close}>
      <View style={[styles.closeBar, { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.closeBar, { backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  menuBar: {
    height: 2,
    borderRadius: 1,
  },
  search: {
    width: 20,
    height: 20,
  },
  searchGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  searchHandle: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 8,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  chevronBox: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    width: 9,
    height: 9,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  close: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBar: {
    position: 'absolute',
    width: 18,
    height: 2,
    borderRadius: 1,
  },
});
