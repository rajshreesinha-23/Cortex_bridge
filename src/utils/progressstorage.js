export function getProgress(user) {
    const data = localStorage.getItem(`progress_${user}`);
    return data ?
        JSON.parse(data) : {
            lessonsCompleted: 0,
            weeklyConsistency: 0,
            skillMastery: 0,
        };
}

export function saveProgress(user, progress) {
    localStorage.setItem(
        `progress_${user}`,
        JSON.stringify(progress)
    );
}