import { AccessToken } from 'livekit-server-sdk';

// @desc    Create LiveKit token for participant
// @route   POST /api/livekit/token
// @access  Public
export const createToken = async (req, res) => {
    try {
        const { roomName, participantName, participantId, role } = req.body;

        if (!roomName || !participantName) {
            return res.status(400).json({ error: 'roomName and participantName are required' });
        }

        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: participantName,
                participantId: participantId || participantName,
                role: role || 'participant'
            }
        );

        // Add grants based on role
        at.addGrant({ 
            roomJoin: true, 
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true
        });

        const token = await at.toJwt();

        res.json({ token });
    } catch (error) {
        console.error('Error creating LiveKit token:', error);
        res.status(500).json({ error: 'Failed to create token' });
    }
};

// @desc    Create LiveKit token for avatar support agent
// @route   POST /api/livekit/avatar-token
// @access  Public
export const createAvatarToken = async (req, res) => {
    try {
        const { roomName, participantName } = req.body;

        if (!roomName || !participantName) {
            return res.status(400).json({ error: 'roomName and participantName are required' });
        }

        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: `avatar-${participantName}`,
                name: `Avatar ${participantName}`
            }
        );

        // Avatar agent gets enhanced permissions
        at.addGrant({ 
            roomJoin: true, 
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            hidden: true, // Avatar can be hidden from participant list
            recorder: true // Avatar can record sessions
        });

        const token = await at.toJwt();

        res.json({ 
            token,
            participantIdentity: `avatar-${participantName}`
        });
    } catch (error) {
        console.error('Error creating LiveKit avatar token:', error);
        res.status(500).json({ error: 'Failed to create avatar token' });
    }
};

// @desc    Get room information
// @route   GET /api/livekit/room/:roomName
// @access  Public
export const getRoomInfo = async (req, res) => {
    try {
        const { roomName } = req.params;
        
        // In a real implementation, this would connect to LiveKit server API
        // to get information about participants, recording status, etc.
        
        res.json({ 
            roomName,
            status: 'active',
            participants: [],
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting room info:', error);
        res.status(500).json({ error: 'Failed to get room information' });
    }
};
