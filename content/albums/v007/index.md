---
title: "V007"
weight: 13
# The cover is also the video's poster (layouts/albums/single.html).
cover: "cover.png"
# The cascade in content/albums/_index.md leaves page resources unpublished; the
# video has no transformed copy to fall back on, so it is served as it is.
build:
  publishResources: true
# v007.mp4 is the source DV capture ("exportation finale.avi") re-encoded for
# the web: the 4:3 DV frame cropped to the 16:9 picture it letterboxed, and its
# anamorphic pixels (PAL 16:15) squared up, so the video is the drawing alone —
# no black bars around it. The capture carries no sound (digital silence,
# -91 dB), so the audio track was dropped:
#
#   ffmpeg -i "exportation finale.avi" \
#     -vf "crop=636:384:42:96,scale=678:384:flags=lanczos,setsar=1" \
#     -c:v libx264 -preset slow -tune animation -crf 20 -profile:v high \
#     -pix_fmt yuv420p -an -movflags +faststart v007.mp4
#
# (the crop is the picture the frames share from start to end: x 41-678,
# y 96-479 in the 720x576 capture.)
#
# cover.png is a frame of that file (t = 0.5s), kept lossless because the line
# art rings under JPEG; it is the album card's cover and the video's poster.
---
