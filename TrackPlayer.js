import TrackPlayer from 'react-native-track-player';

module.exports = async function() {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());
  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.stop());

  await TrackPlayer.setupPlayer();

  await TrackPlayer.add({
    id: '1',
    url: 'your_audio_file_url_here',
    title: 'Track Title',
    artist: 'Track Artist',
    artwork: 'https://picsum.photos/200',
  });
};
