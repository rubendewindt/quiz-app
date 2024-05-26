document.addEventListener('DOMContentLoaded', function() {
    // Your JavaScript code here
    var player;

    // Function to toggle music play/pause and mute/unmute
    document.getElementById('ToggleMusicButton').addEventListener('click', function() {
        if (!player) {
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
                    'onReady': onPlayerReady
                }
            });
        } else {
            if (player.isMuted()) {
                player.unMute();
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                player.mute();
                this.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
            // Store music state in localStorage
            localStorage.setItem('musicState', player.isMuted() ? 'muted' : 'playing');
        }
    });

    function onPlayerReady(event) {
        event.target.playVideo();
        // Update the button icon based on the initial mute state
        var icon = player.isMuted() ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        document.getElementById('ToggleMusicButton').innerHTML = icon;
    }

    // Load the music state when the page loads
    const musicState = localStorage.getItem('musicState');
    if (musicState === 'muted') {
        // Mute the player and update the button icon
        player.mute();
        document.getElementById('ToggleMusicButton').innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        // Unmute the player and update the button icon
        player.unMute();
        document.getElementById('ToggleMusicButton').innerHTML = '<i class="fas fa-volume-up"></i>';
    }
});
