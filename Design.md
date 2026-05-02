# Design

## 1. React API 서비스 코드

### 1.1 개요
React 앱은 정적 데이터 대신 백엔드 API를 호출하여 데이터를 가져오고 저장하도록 변경합니다.
이를 위해 공통 API 호출 모듈을 만들고, 각 탭 컴포넌트에서 이 모듈을 사용하도록 구성합니다.

### 1.2 API 서비스 파일 예시

```js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

async function fetchJson(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export function getUser() {
  return fetchJson(`/user`);
}

export function getCards() {
  return fetchJson(`/cards`);
}

export function createCard(card) {
  return fetchJson(`/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
}

export function prayCard(cardId) {
  return fetchJson(`/cards/${cardId}/pray`, {
    method: "POST",
  });
}

export function getChallenges() {
  return fetchJson(`/challenges`);
}

export function checkChallenge(challengeId, dayIndex) {
  return fetchJson(`/challenges/${challengeId}/check`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dayIndex }),
  });
}

export function getConcerns() {
  return fetchJson(`/concerns`);
}

export function replyConcern(concernId, replyText) {
  return fetchJson(`/concerns/${concernId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ replyText }),
  });
}

export function getCrew() {
  return fetchJson(`/crew`);
}

export function getMeetings() {
  return fetchJson(`/meetings`);
}

export function createMeeting(meeting) {
  return fetchJson(`/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meeting),
  });
}

export function uploadMeetingAttendance(meetingId, member, photoFile) {
  const formData = new FormData();
  formData.append("member", member);
  formData.append("photo", photoFile);

  return fetchJson(`/meetings/${meetingId}/attendance`, {
    method: "POST",
    body: formData,
  });
}

export default {
  getUser,
  getCards,
  createCard,
  prayCard,
  getChallenges,
  checkChallenge,
  getConcerns,
  replyConcern,
  getCrew,
  getMeetings,
  createMeeting,
  uploadMeetingAttendance,
};
```

### 1.3 React API 사용 흐름

- `useEffect`로 초기 데이터 호출
- 사용자 액션 시 API 호출
- API 응답 후 로컬 상태 업데이트
- 에러 발생 시 처리

예:

```js
useEffect(() => {
  getCards().then(setCards).catch(console.error);
}, []);

const handleAdd = async () => {
  const saved = await createCard(newCard);
  setCards((prev) => [saved, ...prev]);
};
```

## 2. API 명세

### 2.1 사용자

| 기능 | HTTP | URL | 요청 바디 | 응답 |
|---|---|---|---|---|
| 사용자 정보 조회 | GET | `/api/user` | 없음 | 사용자 정보 객체 |
| 씨드 업데이트 | PATCH | `/api/user/seeds` | `{ seeds }` | 업데이트된 씨드 값 |

### 2.2 기도 카드

| 기능 | HTTP | URL | 요청 바디 | 응답 |
|---|---|---|---|---|
| 기도 카드 조회 | GET | `/api/cards` | 없음 | 카드 목록 |
| 기도 카드 생성 | POST | `/api/cards` | 카드 객체 | 생성된 카드 객체 |
| 기도 참여 | POST | `/api/cards/{id}/pray` | 없음 | 기도 참여 결과 |

### 2.3 챌린지

| 기능 | HTTP | URL | 요청 바디 | 응답 |
|---|---|---|---|---|
| 챌린지 조회 | GET | `/api/challenges` | 없음 | 챌린지 목록 |
| 챌린지 체크 | PATCH | `/api/challenges/{id}/check` | `{ dayIndex }` | 체크 결과 |

### 2.4 상담

| 기능 | HTTP | URL | 요청 바디 | 응답 |
|---|---|---|---|---|
| 상담 조회 | GET | `/api/concerns` | 없음 | 상담 목록 |
| 상담 답글 | POST | `/api/concerns/{id}/reply` | `{ replyText }` | 응답 결과 |

### 2.5 크루

| 기능 | HTTP | URL | 요청 바디 | 응답 |
|---|---|---|---|---|
| 크루 조회 | GET | `/api/crew` | 없음 | 크루 순위 목록 |

### 2.6 모임

| 기능 | HTTP | URL | 요청 바디 | 응답 |
|---|---|---|---|---|
| 모임 조회 | GET | `/api/meetings` | 없음 | 모임 목록 |
| 모임 생성 | POST | `/api/meetings` | 모임 객체 | 생성된 모임 객체 |
| 참석 인증 | POST | `/api/meetings/{id}/attendance` | `FormData(member, photo)` | 인증 결과 |

## 3. Spring Boot 백엔드 스켈레톤

### 3.1 기본 구성

- Spring Boot
- Spring Web
- Spring Data JPA
- H2 데이터베이스 (개발용)
- Lombok 선택 가능

### 3.2 Maven `pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>ground-backend</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>jar</packaging>

  <name>ground-backend</name>
  <description>Ground backend skeleton for Spring Boot</description>

  <properties>
    <java.version>17</java.version>
    <spring.boot.version>3.2.0</spring.boot.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

### 3.3 애플리케이션 시작 클래스

```java
package com.example.ground;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GroundApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroundApplication.class, args);
    }
}
```

### 3.4 기본 컨트롤러 예시

#### `MeetingController`

```java
package com.example.ground.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "http://localhost:5173")
public class MeetingController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listMeetings() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "id", 1,
                        "name", "금요일 기도 모임",
                        "date", "2026-05-02",
                        "time", "19:00",
                        "location", "교회 기도실",
                        "organizer", "하늘이",
                        "members", List.of("하늘이", "은혜", "다윗"),
                        "maxMembers", 10,
                        "attendances", List.of(Map.of("member", "하늘이", "photo", null, "verified", false)),
                        "description", "주중 피로를 풀고 함께 기도하는 시간입니다"
                )
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMeeting(@RequestBody Map<String, Object> body) {
        body.put("id", System.currentTimeMillis());
        body.put("attendances", List.of());
        body.put("members", List.of("나"));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{meetingId}/attendance")
    public ResponseEntity<Map<String, Object>> uploadAttendance(
            @PathVariable Long meetingId,
            @RequestParam String member,
            @RequestParam MultipartFile photo) {
        return ResponseEntity.ok(Map.of(
                "meetingId", meetingId,
                "member", member,
                "photoUrl", "/uploads/" + photo.getOriginalFilename(),
                "verified", true
        ));
    }
}
```

#### `PrayerCardController`

```java
package com.example.ground.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:5173")
public class PrayerCardController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listCards() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "id", 1,
                        "user", "하늘이",
                        "avatar", "🌸",
                        "text", "오늘 수학 시험 잘 볼 수 있도록",
                        "emoji", "😤",
                        "bg", "from-rose-200 to-pink-300",
                        "count", 12,
                        "prayed", false,
                        "time", "5분 전"
                )
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCard(@RequestBody Map<String, Object> body) {
        body.put("id", System.currentTimeMillis());
        body.put("count", 0);
        body.put("prayed", false);
        body.put("time", "방금");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{cardId}/pray")
    public ResponseEntity<Map<String, Object>> prayCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(Map.of("cardId", cardId, "prayed", true, "countDelta", 1));
    }
}
```

#### `ChallengeController`

```java
package com.example.ground.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:5173")
public class ChallengeController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listChallenges() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "id", 1,
                        "title", "7일 감사 세 줄 쓰기",
                        "day", 4,
                        "total", 7,
                        "icon", "📝",
                        "reward", 50,
                        "done", List.of(true, true, true, true, false, false, false)
                )
        ));
    }

    @PatchMapping("/{id}/check")
    public ResponseEntity<Map<String, Object>> checkChallenge(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("id", id, "dayIndex", body.get("dayIndex"), "checked", true));
    }
}
```

#### `CrewController`

```java
package com.example.ground.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crew")
@CrossOrigin(origins = "http://localhost:5173")
public class CrewController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listCrew() {
        return ResponseEntity.ok(List.of(
                Map.of("name", "새벽빛 중학교", "seed", 1240, "rank", 1),
                Map.of("name", "소망 고등학교", "seed", 980, "rank", 2),
                Map.of("name", "은혜 중학교", "seed", 870, "rank", 3)
        ));
    }
}
```

#### `UserController`

```java
package com.example.ground.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUser() {
        return ResponseEntity.ok(Map.of(
                "id", 1,
                "name", "나",
                "seeds", 185,
                "level", "새싹"
        ));
    }

    @PatchMapping("/seeds")
    public ResponseEntity<Map<String, Object>> updateSeeds(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("seeds", body.get("seeds")));
    }
}
```

### 3.5 개발 환경 설정

`application.properties` 예시:

```properties
spring.datasource.url=jdbc:h2:mem:grounddb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
server.port=8080
```

### 3.6 확장 방향

1. 실제 데이터 저장을 위해 `entity`, `repository`, `service` 계층 추가
2. `@Entity` 기반 JPA 매핑 및 DB 연동
3. 이미지 저장은 로컬 `uploads/` 또는 S3/Azure Blob으로 전환
4. 인증 기능 추가 시 `User` 엔티티와 Spring Security 고려

---

## 4. 결론

- `src/api/api.js`는 React에서 사용할 공통 API 계층입니다.
- API 명세는 프론트엔드와 백엔드가 일관되게 통신하도록 설계되었습니다.
- Spring Boot 스켈레톤은 초기 개발 및 API 프로토타입에 사용할 수 있습니다.
- 실제 서비스로 확장하려면 JPA, DB 영속성, 인증, 파일 스토리지 계층을 추가하면 됩니다.
