;; Tip Jar contract
;; This contract allows users to send tips to other users

;; Constants
(define-constant ERR-MINIMUM-TIP-AMOUNT (err u100))
(define-constant ERR-NOT-AUTHORIZED (err u101))

;; Data variables
(define-data-var min-tip uint u10)
(define-data-var owner principal tx-sender)

;; Function to send a tip to a person
(define-public (send-tip (recipient principal) (message (string-ascii 100)) (amount uint))
  (begin
    ;; Get the current minimum tip amount
    (let ((current-min-tip (var-get min-tip)))
      ;; Check if the amount is greater than or equal to the minimum tip amount
      (asserts! (>= amount current-min-tip) ERR-MINIMUM-TIP-AMOUNT)
      ;; Transfer the amount from the sender to the recipient
      (try! (stx-transfer? amount tx-sender recipient))
      ;; The function returns a success message if the tip is sent successfully
      (ok { recipient: recipient, message: message, amount: amount }))))

;; Function to get the minimum tip amount
(define-read-only (get-min-tip)
  (var-get min-tip)
)

;; Function to update the minimum tip amount (only callable by the owner)
(define-public (set-min-tip (new-min-tip uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> new-min-tip u0) (err u102))
    (var-set min-tip new-min-tip)
    (ok new-min-tip)))
