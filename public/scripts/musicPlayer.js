document.addEventListener('DOMContentLoaded', function() {
    var player;
    var musicPlaying = localStorage.getItem('musicState') === 'playing';

    function onPlayerReady(event) {
        if (musicPlaying) {
            event.target.unMute();
            event.target.playVideo();
        } else {
            event.target.mute();
        }
        updateMusicButton();
    }

    function updateMusicButton() {
        var icon = musicPlaying ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        document.getElementById('ToggleMusicButton').innerHTML = icon;
    }

    function createPlayer() {
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: 'MwBceGgpRaI',
            playerVars: {
                'autoplay': 1,
                'loop': 1,
                'playlist': 'MwBceGgpRaI'
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PAUSED && musicPlaying) {
            document.body.addEventListener('click', playVideoWithSound, { once: true });
        }
    }

    function playVideoWithSound() {
        player.unMute();
        player.playVideo();
    }

    document.getElementById('ToggleMusicButton').addEventListener('click', function() {
        if (!player) {
            console.warn('Player is not initialized yet.');
            return;
        }

        if (musicPlaying) {
            player.mute();
            player.pauseVideo();
            this.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            player.unMute();
            player.playVideo();
            this.innerHTML = '<i class="fas fa-volume-up"></i>';
        }

        musicPlaying = !musicPlaying;
        localStorage.setItem('musicState', musicPlaying ? 'playing' : 'muted');
    });

    window.onYouTubeIframeAPIReady = function() {
        createPlayer();
    };

    // Ensure player is created if API is already loaded
    if (window.YT && window.YT.Player) {
        createPlayer();
    }

    updateMusicButton();
});



