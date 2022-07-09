import ffmpeg from 'fluent-ffmpeg'

// https://trac.ffmpeg.org/wiki/audio%20types
// alicloud: pcm 16bit 16000K singleChannel
export function getAudioStream({ url }) {
    return ffmpeg(url)
        // .inputFormat('flv')
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioBitrate(16)
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .pipe()
}
