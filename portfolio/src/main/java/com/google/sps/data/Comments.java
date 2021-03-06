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

package com.google.sps.data;

public class Comments {
  
  private final String userName;
  private final String userComment;
  private final long timestamp;
  private final long id;

  public Comments(String userName, String userComment, long timestamp, long id) {
    this.userName = userName;
    this.userComment = userComment;
    this.timestamp = timestamp;
    this.id = id;
  }
}

