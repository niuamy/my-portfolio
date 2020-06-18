// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.*;

public final class FindMeetingQuery {

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    //throw new UnsupportedOperationException("TODO: Implement this method.");
    ArrayList<TimeRange> availableMeetingTimes = new ArrayList<>();

    // No options if meeting duration is longer than a day.
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) return availableMeetingTimes;

    // Whole day if no attendees.
    if (request.getAttendees().size() == 0 && request.getOptionalAttendees().size() == 0) {
      availableMeetingTimes.add(TimeRange.WHOLE_DAY);
      return availableMeetingTimes;
    }
    
    // Mandatory Attendees
    Collection<String> mandatoryAttendees = request.getAttendees();
    ArrayList<TimeRange> unavailableTimes = getUnavailableTimes(events, mandatoryAttendees);
    ArrayList<TimeRange> unavailableTimesNoOverlap = removeOverlappingTimes(unavailableTimes);
    ArrayList<TimeRange> allAvailableTimes = getAllAvailableTimes(unavailableTimesNoOverlap);
    ArrayList<TimeRange> mandatoryAvailableMeetingTimes = getAvailableMeetingTimes(allAvailableTimes, (int)request.getDuration());
   
    // Optional Attendees
    Collection<String> optionalAttendees = request.getOptionalAttendees();
    ArrayList<TimeRange> unavailableTimesOptional = getUnavailableTimes(events, optionalAttendees);
    ArrayList<TimeRange> unavailableTimesNoOverlapOptional = removeOverlappingTimes(unavailableTimesOptional);
    ArrayList<TimeRange> allAvailableTimesOptional = getAllAvailableTimes(unavailableTimesNoOverlapOptional);
    ArrayList<TimeRange> optionalAvailableMeetingTimes = getAvailableMeetingTimes(allAvailableTimesOptional, (int)request.getDuration());

    if (mandatoryAttendees.size() == 0 && optionalAttendees.size() > 0) return optionalAvailableMeetingTimes;
    if (optionalAttendees.size() == 0 && mandatoryAttendees.size() > 0) return mandatoryAvailableMeetingTimes;

    // Mandatory and Optional Attendees
    ArrayList<TimeRange> optionalAndMandatory = getUnavailableTimes(events, mandatoryAttendees);
    optionalAndMandatory.addAll(getUnavailableTimes(events, optionalAttendees));
    ArrayList<TimeRange> allUnavailableTimesNoOverlap = removeOverlappingTimes(optionalAndMandatory);
    ArrayList<TimeRange> allAvailableTimesAllAttendees = getAllAvailableTimes(allUnavailableTimesNoOverlap);
    ArrayList<TimeRange> allAvailableMeetingTimes = getAvailableMeetingTimes(allAvailableTimesAllAttendees, (int)request.getDuration());
    
    if (allAvailableMeetingTimes.size() > 0) return allAvailableMeetingTimes;
    return mandatoryAvailableMeetingTimes;
  }

  private ArrayList<TimeRange> getUnavailableTimes(Collection<Event> events, Collection<String> attendees) {
    ArrayList<TimeRange> unavailableTimes = new ArrayList<>();  
    for (Event e : events) {
      boolean containsAttendee = false;  
      Set<String> currentEventAttendees = e.getAttendees();  
      for (String attendee : attendees) {
        if (!containsAttendee && currentEventAttendees.contains(attendee)) {
          unavailableTimes.add(e.getWhen());
          containsAttendee = true;
        } 
      }  
    }
    return unavailableTimes;
  }

  private ArrayList<TimeRange> removeOverlappingTimes(ArrayList<TimeRange> unavailableTimes) {
    ArrayList<TimeRange> blockedTimes = new ArrayList<>();
    unavailableTimes.sort(TimeRange.ORDER_BY_START);
    if (unavailableTimes.size() == 1) return unavailableTimes;

    while (unavailableTimes.size() > 0 ) {
      TimeRange eventA = unavailableTimes.get(0);
      TimeRange eventB = unavailableTimes.get(1);
      if (eventA.overlaps(eventB)) {
        // Case 3: eventA's range completely contains eventB.  
        if (eventA.contains(eventB)) {  
          unavailableTimes.remove(eventB);
        // Case 3: eventB's range completely contains eventA.  
        } else if (eventB.contains(eventA)) {
          unavailableTimes.remove(eventA);
        // Case 2: eventA partially overlaps with eventB.  
        } else {
          int startTime = eventA.start();
          int endTime = eventB.end();
          int i = 1;
          // Loops through all consecutively overlapping events to find the earliest start time and latest end time.
          while (i < unavailableTimes.size()-1) {
            if (unavailableTimes.get(i).end() >= unavailableTimes.get(i+1).start()) {
              endTime = unavailableTimes.get(i+1).end();  
              unavailableTimes.remove(unavailableTimes.get(i));  
            } else {
              i++;
            }
          }  
          blockedTimes.add(TimeRange.fromStartEnd(startTime,endTime,false));
          unavailableTimes.remove(eventA);
          unavailableTimes.remove(eventB);
        }
      } else {    
        blockedTimes.add(eventA);
        unavailableTimes.remove(eventA);
      } 
      if (unavailableTimes.size() == 1) {
        blockedTimes.add(unavailableTimes.get(0));
        unavailableTimes.remove(0);
      }
    }
    return blockedTimes;
  }

  private ArrayList<TimeRange> getAllAvailableTimes(ArrayList<TimeRange> unavailableTimes) {
    ArrayList<TimeRange> availableTimes = new ArrayList<>();
    availableTimes.add(TimeRange.WHOLE_DAY);
    for (TimeRange unavailable : unavailableTimes) {  
      int i = 0;
      while (i < availableTimes.size()) { 
        if (availableTimes.get(i).overlaps(unavailable)) {
          TimeRange available = availableTimes.remove(i);   
          // Case 3: the available time range completely contains the unavailable time range.    
          if (available.contains(unavailable)) {
            availableTimes.add(TimeRange.fromStartEnd(available.start(),unavailable.start(),false));
            availableTimes.add(TimeRange.fromStartEnd(unavailable.end(),available.end(),false));
          // Case 3: the unavailable time range compeletely contains the available time range.  
          } else if (unavailable.overlaps(available)) {
            continue;
          // Case 2: the available time range partially overlaps with the unavailable time range.
          } else {
            if (available.start() < unavailable.start()) {
              availableTimes.add(TimeRange.fromStartEnd(available.start(),unavailable.start(),false));
            } else {
              availableTimes.add(TimeRange.fromStartEnd(unavailable.end(),available.end(),false));  
            }
          }
        } else {
          i++;
        } 
      }
    }
    return availableTimes;
  }
  
  private ArrayList<TimeRange> getAvailableMeetingTimes(ArrayList<TimeRange> allAvailableTimes, int meetingDuration) {
    ArrayList<TimeRange> availableMeetingTimes = new ArrayList<>();
    while (allAvailableTimes.size() > 0) {
      TimeRange available = allAvailableTimes.remove(0);
      int availabilityDuration = available.duration();
      if (meetingDuration <= availabilityDuration) availableMeetingTimes.add(available); 
    }
    return availableMeetingTimes;
  }
}
