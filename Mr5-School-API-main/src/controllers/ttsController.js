import sdk from 'microsoft-cognitiveservices-speech-sdk';

export const getSpeechToken = async (req, res) => {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
        return res.status(500).json({ error: 'Azure Speech credentials not configured' });
    }

    try {
        const { text, voice } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        speechConfig.speechSynthesisVoiceName = voice || "en-US-AvaMultilingualNeural"; // Default voice

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

        synthesizer.speakTextAsync(
            text,
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const audioData = result.audioData;
                    // Convert ArrayBuffer to Buffer
                    const buffer = Buffer.from(audioData);

                    res.set({
                        'Content-Type': 'audio/wav',
                        'Content-Length': buffer.length,
                    });
                    res.send(buffer);
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails);
                    res.status(500).json({ error: 'Speech synthesis failed' });
                }
                synthesizer.close();
            },
            (err) => {
                console.error("err - " + err);
                synthesizer.close();
                res.status(500).json({ error: err });
            }
        );

    } catch (error) {
        console.error('Error in TTS:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
