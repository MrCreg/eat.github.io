  // Global variable to store the current date
        //p.s guided access on ipad pin is 7879
        var currentDate;
        currentDate = new Date();

        // Function to fetch meeting data from an ICS file
        async function fetchMeetingData(icsFileURL) {
            try {
                const response = await fetch(icsFileURL);
                const data = await response.text();
                const meetings = parseICSData(data);

                currentDate = new Date();

                populateMeetingData(meetings);
                updateHeader(meetings);
                updateFooter();
            } catch (error) {
                // Log an error message and return an empty array in case of an error
                console.error('Error fetching meeting data:', error);
            }
        }

        // Function to parse ICS data and extract relevant information
        function parseICSData(icsData) {
            const meetings = [];

            // Regular expression pattern to match each VEVENT block in the ICS data
            const regexEvent = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;

            // Regular expression patterns to extract specific fields within a VEVENT block
            const regexUid = /UID:(.*?)\n/;
            const regexStart = /DTSTART:(.*?)\n/;
            const regexEnd = /DTEND:(.*?)\n/;
            const regexSummary = /SUMMARY:(.*?)\n/;
            const regexDescription = /DESCRIPTION:(.*?)\n/;
            const regexLocation = /LOCATION:(.*?)\n/;

            let matchEvent;

            // Iterate through each VEVENT block in the ICS data
            while ((matchEvent = regexEvent.exec(icsData)) !== null) {
                const eventBlock = matchEvent[1];
console.log("matched");
                // Extract individual fields from the VEVENT block
                const uid = getValueFromRegex(regexUid, eventBlock);
                const start = getValueFromRegex(regexStart, eventBlock);
                const end = getValueFromRegex(regexEnd, eventBlock);
                const summary = getValueFromRegex(regexSummary, eventBlock);
                const description = getValueFromRegex(regexDescription, eventBlock);
                const location = getValueFromRegex(regexLocation, eventBlock);

                console.log("meeting start:" + start);
                console.log("meeting end:" + end);

                // Check if the meeting is scheduled for the current day
                const meetingDate = new Date(start);
                console.log("meet" + meetingDate + "current:" + currentDate);
                console.log("TEST1: meet" + meetingDate.getDate() + "current:" + currentDate.getDate());
                console.log("TEST2: meet" + meetingDate.getMonth() + "current:" + currentDate.getMonth());
                console.log("TEST3: meet" + meetingDate.getFullYear() + "current:" + currentDate.getFullYear());
                if (
                    meetingDate.getDate() === currentDate.getDate() &&
                    meetingDate.getMonth() === currentDate.getMonth() &&
                    meetingDate.getFullYear() === currentDate.getFullYear()
                ) {
                    // Add the extracted meeting information to the array
                    meetings.push({ uid, start, end, summary, description, location });
                }
            }

            // Sort meetings by the "start" field
        meetings.sort(function(a, b) {
            const startTimeA = new Date(a.start);
            const startTimeB = new Date(b.start);
            return startTimeA - startTimeB;
        });

            console.log("Meeting Array Follows:");
console.log(meetings);
            return meetings;
        }

        // Helper function to extract values using a regular expression
        function getValueFromRegex(regex, text) {
            const match = regex.exec(text);
            return match ? match[1] : null;
        }

        // Function to generate meeting information
        function generateMeetingInfo(meeting) {
            const startTime = new Date(meeting.start);
            const endTime = new Date(meeting.end);
            const durationMS = endTime.getTime() - startTime.getTime();
            const isInProgress = startTime <= currentDate && currentDate <= endTime;



            // Check if the meeting has ended
            const hasEnded = currentDate > endTime;


            const minutesDiff = Math.floor(durationMS / (1000 * 60));
            const hoursDiff = Math.floor(minutesDiff / 60);
            var diffString = "";

            if (hoursDiff >= 1) {
                diffString = `${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'}`;
            } else {
                diffString = `${minutesDiff} ${minutesDiff === 1 ? 'minute' : 'minutes'}`;
            }

            // Add the "current-meeting" class for the in-progress meeting

            const meetingClasses = `meeting-info ${isInProgress ? 'in-progress' : ''} ${hasEnded ? 'past-meeting' : ''}`;

            return `
            <div class="${meetingClasses}">
                    <h1>${formatTime(meeting.start)} to ${formatTime(meeting.end)} (${diffString})</h1>
                    <h3>Booked By: ${meeting.summary}</h3>
                </div>
            `;
        }

        // Function to populate the meeting data on the page
        function populateMeetingData(meetings) {
            var meetingDataElement = document.getElementById('meetingData');
            var meetingContent = '';

            // Loop through meetings and generate meeting info
            meetings.forEach(function (meeting) {
                meetingContent += generateMeetingInfo(meeting);
            });

            // Insert the meeting content into the page
            meetingDataElement.innerHTML = meetingContent;
        }

        // Function to check if there's a meeting in progress
        function isMeetingInProgress(meetings) {
        
            var currentTime = currentDate.getTime();

            // Loop through meetings and check if there's one in progress
            for (var i = 0; i < meetings.length; i++) {
                var startTime = new Date(meetings[i].start);
                var endTime = new Date(meetings[i].end);

                if (startTime <= currentTime && currentTime <= endTime) {
                    return true;
                }
            }

            return false;
        }

        // Function to update the header based on meeting status
        function updateHeader(meetings) {
            var meetingStatusElement = document.getElementById('meetingStatus');
            var isInProgress = isMeetingInProgress(meetings);

            if (isInProgress) {
                // Create a new span element
                meetingStatusElement.classList.add('in-progress');
    const blinkSpan = document.createElement('span');
    blinkSpan.classList.add('blink'); // Add the "blink" class to the span

    // Set the text content inside the span
    blinkSpan.textContent = 'Meeting In Progress';

    // Clear the existing content and append the span
    meetingStatusElement.innerHTML = '';
    meetingStatusElement.appendChild(blinkSpan);
            } else {
                meetingStatusElement.classList.remove('in-progress');
                // Remove the child elements inside meetingStatusElement
while (meetingStatusElement.firstChild) {
    meetingStatusElement.removeChild(meetingStatusElement.firstChild);
}
                // Find the next upcoming meeting for the current day
          
                

                var nextMeeting = meetings.find(function (meeting) {
                    var startTime = new Date(meeting.start);

                    // Check if the meeting is for the current day
                    if (startTime >= currentDate) {
                        return true;
                    }
                });

                // Display "Room Available for X minutes/hours until the next booking"
                if (nextMeeting) {
                    var startTime = new Date(nextMeeting.start);
                    var timeDifference = startTime - currentDate;
                    console.log("td: " + timeDifference);
                    var minutesDifference = Math.floor(timeDifference / (1000 * 60));
                    var hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
                    console.log("hd: " + hoursDifference);

                    if (minutesDifference > 0 && hoursDifference < 1) {
                        meetingStatusElement.textContent = `Available for next ${minutesDifference} minutes`;
                    } else if (hoursDifference >= 1) {
                        meetingStatusElement.textContent = `Available for next ${hoursDifference} hours`;
                    }
                } else {
                    // If no upcoming meetings for the current day, display "Room Available"
                    meetingStatusElement.textContent = 'Available';
                }
            }
        }
    
        function updateFooter() {
            const currentTimeElement = document.getElementById('currentTime');
            const hours = currentDate.getHours();
            const minutes = currentDate.getMinutes();
            const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
            currentTimeElement.textContent = `${formattedTime}`;
        }

        // Function to format time
        function formatTime(dateTimeString) {
            const dateTime = new Date(dateTimeString);

            const hours = dateTime.getHours();
            const minutes = dateTime.getMinutes();
            const formattedHours = hours < 10 ? `0${hours}` : hours;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

            return `${formattedHours}:${formattedMinutes}`;
        }

        
        fetchMeetingData('cg6.ics');

        //And run every minute
        setInterval(function () {
            fetchMeetingData('cg6.ics');

        }, 60000); // Check every minute
