
const API_KEY = "AIzaSyCERd1wzR7Z1K5EBPF42FtxG9K4av0VGaI";


const PLAYLIST_ID = "UUOxUnK2SXv6Y4Qf-UYsswIA";

async function loadLatestVideos() {
    const videoList = document.getElementById("video-list");
    if (!videoList) return;

    videoList.innerHTML = "<p>Loading Sajonz videos...</p>";

    try {
        const playlistUrl =
            "https://www.googleapis.com/youtube/v3/playlistItems" +
            "?part=snippet&maxResults=50" +
            "&playlistId=" + PLAYLIST_ID +
            "&key=" + API_KEY;

        const playlistResponse = await fetch(playlistUrl);
        const playlistData = await playlistResponse.json();

        if (!playlistResponse.ok) {
            throw new Error("Could not load playlist");
        }

        const uploads = playlistData.items || [];

        if (uploads.length === 0) {
            videoList.innerHTML = "<p>No public videos found.</p>";
            return;
        }

        const videoIds = uploads
            .map(item => item.snippet.resourceId.videoId)
            .join(",");

        const detailsUrl =
            "https://www.googleapis.com/youtube/v3/videos" +
            "?part=snippet,contentDetails&id=" + videoIds +
            "&key=" + API_KEY;

        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (!detailsResponse.ok) {
            throw new Error("Could not load video details");
        }

        const detailsById = {};

        (detailsData.items || []).forEach(video => {
            detailsById[video.id] = video;
        });

        function durationInSeconds(duration) {
            const match = duration.match(
                /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
            );

            if (!match) return 0;

            return Number(match[1] || 0) * 3600 +
                   Number(match[2] || 0) * 60 +
                   Number(match[3] || 0);
        }

        // Show the latest 3 videos longer than 2 minutes
        const latestVideos = uploads
            .filter(item => {
                const id = item.snippet.resourceId.videoId;
                const video = detailsById[id];

                return video &&
                    durationInSeconds(video.contentDetails.duration) > 120;
            })
            .slice(0, 3);

        if (latestVideos.length === 0) {
            videoList.innerHTML =
                "<p>No videos longer than 2 minutes were found.</p>";
            return;
        }

        videoList.innerHTML = latestVideos.map(item => {
            const id = item.snippet.resourceId.videoId;
            const video = detailsById[id];
            const title = video.snippet.title;

            const safeTitle = title.replace(/[&<>"']/g, character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]);

            const thumbnails = video.snippet.thumbnails;
            const thumbnail =
                thumbnails.high?.url ||
                thumbnails.medium?.url ||
                thumbnails.default?.url;

            return `
                <a class="video-card"
                   href="https://www.youtube.com/watch?v=${id}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <img src="${thumbnail}" alt="${safeTitle}" loading="lazy">
                    <h3>${safeTitle}</h3>
                    <p>Watch on YouTube ▶</p>
                </a>
            `;
        }).join("");

    } catch (error) {
        console.error("YouTube videos error:", error);
        videoList.innerHTML =
            "<p>Videos could not load. Please try again later.</p>";
    }
}

loadLatestVideos();
setInterval(loadLatestVideos, 10 * 60 * 1000);


 if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAppleMusicReleases);
} else {
    loadAppleMusicReleases();
    setInterval(loadAppleMusicReleases, 10 * 60 * 1000);
}
 async function loadAppleMusicReleases() {
    const catalogue = document.getElementById("auto-music-catalogue");

    if (!catalogue) return;

    const url =
        "https://itunes.apple.com/search?term=Sajonz&entity=song&country=ke&limit=50";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Apple Music search failed");
        }

        const data = await response.json();

      const albums = [...new Map(
    data.results
        .filter(album =>
            album.artistName &&
            album.artistName.toLowerCase() === "sajonz"
        )
        .map(album => [album.trackId, album])
)].map(entry => entry[1])
.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

        if (albums.length === 0) {
            catalogue.innerHTML =
                "<p>No releases found in Apple's search results.</p>" +
                '<p><a href="https://music.apple.com/ke/artist/sajonz/6773919573" target="_blank" rel="noopener noreferrer">Visit Sajonz on Apple Music</a></p>';
            return;
        }

        catalogue.innerHTML = albums.map(album => {
            const artwork = album.artworkUrl100
                ? album.artworkUrl100.replace("100x100", "600x600")
                : "";

            return `
                <article class="music-card">
                    ${artwork ? `<img src="${artwork}" alt="Cover for ${album.collectionName}" loading="lazy">` : ""}
                    <h4>${album.collectionName}</h4>
                    <a href="${album.collectionViewUrl}" target="_blank" rel="noopener noreferrer" class="button">
                        LISTEN ON APPLE MUSIC
                    </a>
                </article>
            `;
        }).join("");

    } catch (error) {
        console.error("Apple Music catalogue error:", error);

        catalogue.innerHTML =
            "<p>Apple Music releases could not load. Check your internet connection and try again.</p>" +
            '<p><a href="https://music.apple.com/ke/artist/sajonz/6773919573" target="_blank" rel="noopener noreferrer">Visit Sajonz on Apple Music</a></p>';
    }
}

