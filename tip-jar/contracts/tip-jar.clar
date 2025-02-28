;; Tip Jar contract
;; This contract allows users to send tips to other users

;; Constants
;; Minimum tip amount
(define-constant MIN-TIP u10)
;; Error code for minimum tip amount
(define-constant ERR-MINIMUM-TIP-AMOUNT (err u100))

;; Function to send a tip to a person
(define-public (send-tip (recipient principal) (message (string-ascii 100)) (amount uint))
  (begin
    ;; Check if the amount is greater than or equal to the minimum tip amount
    (asserts! (>= amount MIN-TIP) ERR-MINIMUM-TIP-AMOUNT)
    ;; Transfer the amount from the sender to the recipient
    (try! (stx-transfer? amount tx-sender recipient))
    ;; The function returns a success message if the tip is sent successfully
    (ok { recipient: recipient, message: message, amount: amount })
  ))

;; Function to get the minimum tip amount
(define-read-only (get-min-tip)
  MIN-TIP
)
