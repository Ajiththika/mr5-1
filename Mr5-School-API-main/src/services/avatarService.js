class AvatarService {
    constructor() {
        // In a real implementation, this would connect to the Beyond Presence API
        this.avatarStates = new Map(); // Store avatar states in memory
    }

    // Set avatar pose
    async setPose(participantId, pose) {
        const validPoses = ['idle', 'listening', 'speaking', 'typing'];
        
        if (!validPoses.includes(pose)) {
            throw new Error(`Invalid pose. Valid poses are: ${validPoses.join(', ')}`);
        }

        // Store the pose for this participant
        this.avatarStates.set(participantId, {
            ...this.avatarStates.get(participantId),
            pose,
            updatedAt: new Date().toISOString()
        });

        // In a real implementation, this would call the Beyond Presence API
        console.log(`Setting avatar pose to ${pose} for participant ${participantId}`);
        
        return {
            status: 'ok',
            status_code: 200,
            short_message: `Pose set to ${pose}`
        };
    }

    // Lip sync animation
    async lipSync(participantId, text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text is required for lip sync');
        }

        // Store the lip sync request
        this.avatarStates.set(participantId, {
            ...this.avatarStates.get(participantId),
            lipSyncText: text,
            lipSyncActive: true,
            updatedAt: new Date().toISOString()
        });

        // In a real implementation, this would call the Beyond Presence API
        console.log(`Initiating lip sync for participant ${participantId} with text: ${text}`);
        
        return {
            status: 'ok',
            status_code: 200,
            short_message: 'Lip sync initiated'
        };
    }

    // Show notification
    async showNotification(participantId, text, durationMs = 3000) {
        if (!text || typeof text !== 'string') {
            throw new Error('Notification text is required');
        }

        // Store the notification
        this.avatarStates.set(participantId, {
            ...this.avatarStates.get(participantId),
            notification: {
                text,
                durationMs,
                shownAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
        });

        // In a real implementation, this would call the Beyond Presence API
        console.log(`Showing notification for participant ${participantId}: ${text} (${durationMs}ms)`);
        
        return {
            status: 'ok',
            status_code: 200,
            short_message: 'Notification shown'
        };
    }

    // Get avatar state
    async getAvatarState(participantId) {
        return this.avatarStates.get(participantId) || {
            pose: 'idle',
            lipSyncActive: false,
            notification: null
        };
    }

    // Reset avatar state
    async resetAvatarState(participantId) {
        this.avatarStates.delete(participantId);
        
        return {
            status: 'ok',
            status_code: 200,
            short_message: 'Avatar state reset'
        };
    }
}

export default new AvatarService();