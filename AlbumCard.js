import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const AlbumCard = ({ album, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: album.photos[0]?.uri }} style={styles.image} />
      {album.title && <Text style={styles.title}>{album.title}</Text>}
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    width: Dimensions.get('window').width / 2 - 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photo: {
    width: 50,
    height: 50,
    marginRight: 10,
    marginBottom: 10,
  },
});

export default AlbumCard;
