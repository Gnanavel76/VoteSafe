import face_recognition
import sys


def detectFace(capturedVoterImage, knownVoterImage):
    known_image = face_recognition.load_image_file(knownVoterImage)
    unknown_image = face_recognition.load_image_file(capturedVoterImage)

    biden_encoding = face_recognition.face_encodings(known_image)[0]
    unknown_encoding = face_recognition.face_encodings(unknown_image)[0]

    results = face_recognition.compare_faces(
        [biden_encoding], unknown_encoding)
    print(results)


if __name__ == "__main__":
    detectFace(sys.argv[1], sys.argv[2])
