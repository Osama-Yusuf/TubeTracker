// Chart visualization for TubeTracker
class PlaylistVisualizer {
    constructor() {
        this.chart = null;
        this.chartColors = {
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)',
                'rgba(83, 102, 255, 0.7)',
                'rgba(40, 159, 64, 0.7)',
                'rgba(210, 199, 199, 0.7)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)',
                'rgba(40, 159, 64, 1)',
                'rgba(210, 199, 199, 1)',
            ]
        };
    }

    // Create duration distribution chart
    createDurationChart(videos, container) {
        if (!videos || videos.length === 0) {
            console.warn('No videos provided for chart');
            return;
        }
        
        // Make sure the container is visible
        if (container) {
            container.style.display = 'block';
        }
        
        // Group videos by duration ranges
        const durationRanges = this._groupByDuration(videos);
        
        // Prepare chart data
        const labels = Object.keys(durationRanges);
        const data = Object.values(durationRanges);
        
        // Get canvas context
        const canvas = document.getElementById('duration-chart');
        if (!canvas) {
            console.error('Chart canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context from canvas');
            return;
        }
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Videos',
                    data: data,
                    backgroundColor: this.chartColors.backgroundColor,
                    borderColor: this.chartColors.borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Video Duration Distribution',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw} videos`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Number of Videos'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Duration Range'
                        }
                    }
                }
            }
        });
        
        // Show the container
        container.style.display = 'block';
    }
    
    // Create a pie chart showing video distribution
    createCategoryChart(videos, container) {
        // This could be implemented if you have category data in the future
    }
    
    // Helper method to group videos by duration ranges
    _groupByDuration(videos) {
        const ranges = {
            'Under 1 min': 0,
            '1-3 mins': 0,
            '3-5 mins': 0,
            '5-10 mins': 0,
            '10-20 mins': 0,
            '20-30 mins': 0,
            '30-60 mins': 0,
            'Over 60 mins': 0
        };
        
        videos.forEach(video => {
            const durationMinutes = video.durationMinutes || 0;
            
            if (durationMinutes < 1) {
                ranges['Under 1 min']++;
            } else if (durationMinutes < 3) {
                ranges['1-3 mins']++;
            } else if (durationMinutes < 5) {
                ranges['3-5 mins']++;
            } else if (durationMinutes < 10) {
                ranges['5-10 mins']++;
            } else if (durationMinutes < 20) {
                ranges['10-20 mins']++;
            } else if (durationMinutes < 30) {
                ranges['20-30 mins']++;
            } else if (durationMinutes < 60) {
                ranges['30-60 mins']++;
            } else {
                ranges['Over 60 mins']++;
            }
        });
        
        // Remove empty ranges
        return Object.fromEntries(
            Object.entries(ranges).filter(([_, value]) => value > 0)
        );
    }
}
